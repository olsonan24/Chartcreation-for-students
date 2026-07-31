import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database, TablesInsert, TablesUpdate } from "../../lib/supabase/database.types";
import { requireSupabaseClient } from "../../lib/supabase/client";
import {
  appDobToDatabaseDate,
  mapPeopleRow,
  normalizePersonInput,
} from "./people.mapper";
import type { Client, PersonInput } from "./people.types";

export type PeopleOperation = "authenticate" | "list" | "create" | "update" | "delete";

export class PeopleRepositoryError extends Error {
  readonly operation: PeopleOperation;
  readonly causeCode?: string;

  constructor(operation: PeopleOperation, message: string, causeCode?: string) {
    super(message);
    this.name = "PeopleRepositoryError";
    this.operation = operation;
    this.causeCode = causeCode;
  }
}

export interface PeopleRepository {
  listPeople(): Promise<Client[]>;
  createPerson(input: PersonInput): Promise<Client>;
  updatePerson(id: string, input: PersonInput): Promise<Client>;
  deletePerson(id: string): Promise<void>;
}

async function requireUser(client: SupabaseClient<Database>, expectedUserId?: string): Promise<User> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || (expectedUserId && data.user.id !== expectedUserId)) {
    throw new PeopleRepositoryError(
      "authenticate",
      "Your session could not be verified. Sign in again and retry.",
      error?.code,
    );
  }
  return data.user;
}

function databaseFailure(
  operation: PeopleOperation,
  fallbackMessage: string,
  error: { code?: string } | null,
): PeopleRepositoryError {
  return new PeopleRepositoryError(operation, fallbackMessage, error?.code);
}

export function createPeopleRepository(
  client: SupabaseClient<Database> = requireSupabaseClient(),
  expectedUserId?: string,
): PeopleRepository {
  return {
    async listPeople() {
      const user = await requireUser(client, expectedUserId);
      const { data, error } = await client
        .from("people")
        .select("id,user_id,full_name,called_name,date_of_birth,created_at,updated_at")
        .eq("user_id", user.id)
        .order("full_name", { ascending: true });

      if (error) {
        throw databaseFailure("list", "Your saved people could not be loaded. Retry when online.", error);
      }
      return (data ?? []).map(mapPeopleRow);
    },

    async createPerson(input) {
      const user = await requireUser(client, expectedUserId);
      const normalized = normalizePersonInput(input);
      const row: TablesInsert<"people"> = {
        user_id: user.id,
        full_name: normalized.fullName,
        called_name: normalized.calledName,
        date_of_birth: appDobToDatabaseDate(normalized.dob),
      };
      const { data, error } = await client.from("people").insert(row).select().single();

      if (error || !data) {
        throw databaseFailure("create", "This person could not be saved. Your existing records were not changed.", error);
      }
      return mapPeopleRow(data);
    },

    async updatePerson(id, input) {
      const user = await requireUser(client, expectedUserId);
      const normalized = normalizePersonInput(input);
      const row: TablesUpdate<"people"> = {
        full_name: normalized.fullName,
        called_name: normalized.calledName,
        date_of_birth: appDobToDatabaseDate(normalized.dob),
      };
      const { data, error } = await client
        .from("people")
        .update(row)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error || !data) {
        throw databaseFailure("update", "Changes could not be saved. The existing record is still visible.", error);
      }
      return mapPeopleRow(data);
    },

    async deletePerson(id) {
      const user = await requireUser(client, expectedUserId);
      const { data, error } = await client
        .from("people")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        throw databaseFailure("delete", "This person could not be removed. The record is still visible.", error);
      }
    },
  };
}
