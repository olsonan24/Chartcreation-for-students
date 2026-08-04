import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../auth/useAuth";
import {
  inspectLegacyPeople,
  LEGACY_STORAGE_KEY,
  legacyImportWasHandled,
  markLegacyImportHandled,
  planLegacyImport,
} from "./legacyImport";
import { createPeopleRepository, type PeopleRepository } from "./people.repository";
import type { Client, PersonInput } from "./people.types";

export type PeopleMutation = "create" | "update" | "delete" | "import";

export type LegacyOffer = {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  importableCount: number;
  parseError: boolean;
};

function sortPeople(people: Client[]): Client[] {
  return [...people].sort((a, b) => a.fullName.localeCompare(b.fullName));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The cloud operation failed. Retry when online.";
}

export function usePeople(repositoryOverride?: PeopleRepository) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const currentUserIdRef = useRef<string | null>(userId);
  currentUserIdRef.current = userId;
  const repository = useMemo(
    () => repositoryOverride ?? createPeopleRepository(undefined, userId ?? undefined),
    [repositoryOverride, userId],
  );
  const [people, setPeople] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [mutation, setMutation] = useState<PeopleMutation | null>(null);
  const mutationRef = useRef<PeopleMutation | null>(null);
  const mutationTokenRef = useRef<symbol | null>(null);
  const [legacyOffer, setLegacyOffer] = useState<LegacyOffer | null>(null);

  const detectLegacyOffer = useCallback((loadedPeople: Client[]) => {
    if (!user || typeof window === "undefined") return;
    const storage = window.localStorage;
    if (legacyImportWasHandled(storage, user.id)) {
      setLegacyOffer(null);
      return;
    }
    const inspection = inspectLegacyPeople(storage.getItem(LEGACY_STORAGE_KEY));
    const plan = planLegacyImport(inspection.valid, loadedPeople);
    if (!inspection.parseError && inspection.valid.length === 0 && inspection.invalidCount === 0) {
      setLegacyOffer(null);
      return;
    }
    setLegacyOffer({
      validCount: inspection.valid.length,
      invalidCount: inspection.invalidCount,
      duplicateCount: plan.duplicateCount,
      importableCount: plan.importable.length,
      parseError: inspection.parseError,
    });
  }, [user]);

  const loadPeople = useCallback(async () => {
    if (!user) {
      setPeople([]);
      setLoading(false);
      setLoadError("");
      setOperationError("");
      setLegacyOffer(null);
      return [];
    }
    const requestUserId = user.id;
    setLoading(true);
    setLoadError("");
    try {
      const loaded = await repository.listPeople();
      if (currentUserIdRef.current !== requestUserId) return [];
      const sorted = sortPeople(loaded);
      setPeople(sorted);
      detectLegacyOffer(sorted);
      return sorted;
    } catch (error) {
      if (currentUserIdRef.current === requestUserId) setLoadError(errorMessage(error));
      return [];
    } finally {
      if (currentUserIdRef.current === requestUserId) setLoading(false);
    }
  }, [detectLegacyOffer, repository, user]);

  useEffect(() => {
    if (!user) {
      setPeople([]);
      setLoading(false);
      setLoadError("");
      setOperationError("");
      mutationRef.current = null;
      mutationTokenRef.current = null;
      setMutation(null);
      setLegacyOffer(null);
      return;
    }
    void loadPeople();
  }, [loadPeople, user]);

  const createPerson = useCallback(async (input: PersonInput) => {
    if (mutationRef.current) throw new Error("Another save is already in progress.");
    const requestUserId = userId;
    const mutationToken = Symbol("create");
    mutationRef.current = "create";
    mutationTokenRef.current = mutationToken;
    setMutation("create");
    setOperationError("");
    try {
      const created = await repository.createPerson(input);
      if (currentUserIdRef.current === requestUserId) {
        setPeople((current) => sortPeople([...current, created]));
      }
      return created;
    } catch (error) {
      if (currentUserIdRef.current === requestUserId) setOperationError(errorMessage(error));
      throw error;
    } finally {
      if (mutationTokenRef.current === mutationToken) {
        mutationRef.current = null;
        mutationTokenRef.current = null;
        setMutation(null);
      }
    }
  }, [repository, userId]);

  const updatePerson = useCallback(async (id: string, input: PersonInput) => {
    if (mutationRef.current) throw new Error("Another save is already in progress.");
    const requestUserId = userId;
    const mutationToken = Symbol("update");
    mutationRef.current = "update";
    mutationTokenRef.current = mutationToken;
    setMutation("update");
    setOperationError("");
    try {
      const updated = await repository.updatePerson(id, input);
      if (currentUserIdRef.current === requestUserId) {
        setPeople((current) => sortPeople(current.map((person) => person.id === id ? updated : person)));
      }
      return updated;
    } catch (error) {
      if (currentUserIdRef.current === requestUserId) setOperationError(errorMessage(error));
      throw error;
    } finally {
      if (mutationTokenRef.current === mutationToken) {
        mutationRef.current = null;
        mutationTokenRef.current = null;
        setMutation(null);
      }
    }
  }, [repository, userId]);

  const deletePerson = useCallback(async (id: string) => {
    if (mutationRef.current) throw new Error("Another change is already in progress.");
    const requestUserId = userId;
    const mutationToken = Symbol("delete");
    mutationRef.current = "delete";
    mutationTokenRef.current = mutationToken;
    setMutation("delete");
    setOperationError("");
    try {
      await repository.deletePerson(id);
      if (currentUserIdRef.current === requestUserId) {
        setPeople((current) => current.filter((person) => person.id !== id));
      }
    } catch (error) {
      if (currentUserIdRef.current === requestUserId) setOperationError(errorMessage(error));
      throw error;
    } finally {
      if (mutationTokenRef.current === mutationToken) {
        mutationRef.current = null;
        mutationTokenRef.current = null;
        setMutation(null);
      }
    }
  }, [repository, userId]);

  const importLegacyPeople = useCallback(async () => {
    if (!user || typeof window === "undefined" || mutationRef.current) return;
    const storage = window.localStorage;
    const inspection = inspectLegacyPeople(storage.getItem(LEGACY_STORAGE_KEY));
    if (inspection.parseError) {
      setOperationError("The old on-device records could not be read. They were not changed.");
      return;
    }
    const plan = planLegacyImport(inspection.valid, people);
    const requestUserId = user.id;
    const mutationToken = Symbol("import");
    mutationRef.current = "import";
    mutationTokenRef.current = mutationToken;
    setMutation("import");
    setOperationError("");
    const created: Client[] = [];
    try {
      for (const input of plan.importable) {
        if (currentUserIdRef.current !== requestUserId) {
          throw new Error("The signed-in account changed during import. No further records were uploaded.");
        }
        created.push(await repository.createPerson(input));
      }
      if (currentUserIdRef.current !== requestUserId) return;
      setPeople((current) => sortPeople([...current, ...created]));
      markLegacyImportHandled(storage, user.id, "imported");
      setLegacyOffer(null);
    } catch (error) {
      if (currentUserIdRef.current === requestUserId) {
        setOperationError(`${errorMessage(error)} Old on-device records were not removed or marked as imported.`);
        await loadPeople();
      }
      throw error;
    } finally {
      if (mutationTokenRef.current === mutationToken) {
        mutationRef.current = null;
        mutationTokenRef.current = null;
        setMutation(null);
      }
    }
  }, [loadPeople, people, repository, user]);

  const skipLegacyImport = useCallback(() => {
    if (!user || typeof window === "undefined") return;
    markLegacyImportHandled(window.localStorage, user.id, "skipped");
    setLegacyOffer(null);
  }, [user]);

  return {
    people,
    loading,
    loadError,
    operationError,
    mutation,
    legacyOffer,
    retry: loadPeople,
    createPerson,
    updatePerson,
    deletePerson,
    importLegacyPeople,
    skipLegacyImport,
    clearOperationError: () => setOperationError(""),
  };
}
