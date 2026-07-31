import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthContext, type AuthContextValue } from "../features/auth/AuthProvider";
import { legacyImportWasHandled } from "../features/people/legacyImport";
import type { PeopleRepository } from "../features/people/people.repository";
import type { Client } from "../features/people/people.types";
import { usePeople } from "../features/people/usePeople";

const person: Client = {
  id: "0ad275b0-818f-4424-87eb-a3089fa458ff",
  fullName: "Roman Peter Vaughan",
  calledName: "Roman",
  dob: "24/05/1992",
};

const authValue = {
  status: "authenticated",
  session: null,
  user: { id: "84662d76-271b-40c8-9ce7-29fb621efe56", email: "student@example.com" },
  error: "",
  notice: "",
  submitting: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  clearMessages: vi.fn(),
} as unknown as AuthContextValue;
let currentAuthValue = authValue;

function wrapper({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={currentAuthValue}>{children}</AuthContext.Provider>;
}

function repository(overrides: Partial<PeopleRepository> = {}): PeopleRepository {
  return {
    listPeople: vi.fn().mockResolvedValue([person]),
    createPerson: vi.fn().mockResolvedValue(person),
    updatePerson: vi.fn().mockResolvedValue(person),
    deletePerson: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("people loading and confirmed mutations", () => {
  beforeEach(() => {
    localStorage.clear();
    currentAuthValue = authValue;
  });

  it("reports loading until the signed-in user's records resolve", async () => {
    let resolve!: (people: Client[]) => void;
    const pending = new Promise<Client[]>((done) => { resolve = done; });
    const repo = repository({ listPeople: vi.fn(() => pending) });
    const { result } = renderHook(() => usePeople(repo), { wrapper });

    expect(result.current.loading).toBe(true);
    act(() => resolve([person]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.people).toEqual([person]);
  });

  it("keeps an existing record visible when save fails", async () => {
    const repo = repository({ updatePerson: vi.fn().mockRejectedValue(new Error("Save failed")) });
    const { result } = renderHook(() => usePeople(repo), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.updatePerson(person.id, { fullName: "Changed", calledName: "", dob: person.dob })).rejects.toThrow("Save failed");
    });
    expect(result.current.people).toEqual([person]);
    expect(result.current.operationError).toBe("Save failed");
  });

  it("keeps a record visible when delete fails", async () => {
    const repo = repository({ deletePerson: vi.fn().mockRejectedValue(new Error("Delete failed")) });
    const { result } = renderHook(() => usePeople(repo), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.deletePerson(person.id)).rejects.toThrow("Delete failed");
    });
    expect(result.current.people).toEqual([person]);
    expect(result.current.operationError).toBe("Delete failed");
  });

  it("rejects a duplicate submission while a create is pending", async () => {
    let resolve!: (person: Client) => void;
    const pending = new Promise<Client>((done) => { resolve = done; });
    const repo = repository({ createPerson: vi.fn(() => pending) });
    const { result } = renderHook(() => usePeople(repo), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const first = result.current.createPerson({ fullName: "New Person", calledName: "", dob: "01/01/2000" });
    await expect(result.current.createPerson({ fullName: "New Person", calledName: "", dob: "01/01/2000" })).rejects.toThrow("already in progress");
    act(() => resolve({ ...person, id: "50379f10-0389-4470-88e2-088a704a4bd2", fullName: "New Person", calledName: "", dob: "01/01/2000" }));
    await act(async () => { await first; });
    expect(repo.createPerson).toHaveBeenCalledTimes(1);
  });

  it("preserves legacy data and recovers safely after a partial import", async () => {
    const raw = JSON.stringify([
      { id: "legacy-1", fullName: "First Legacy", calledName: "", dob: "01/01/2000" },
      { id: "legacy-2", fullName: "Second Legacy", calledName: "", dob: "02/02/2001" },
    ]);
    localStorage.setItem("pass7-mobile-clients-v1", raw);
    const firstCreated = { ...person, id: "50379f10-0389-4470-88e2-088a704a4bd2", fullName: "First Legacy", calledName: "", dob: "01/01/2000" };
    const repo = repository({
      listPeople: vi.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([firstCreated]),
      createPerson: vi.fn()
        .mockResolvedValueOnce(firstCreated)
        .mockRejectedValueOnce(new Error("Second import failed")),
    });
    const { result } = renderHook(() => usePeople(repo), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.legacyOffer?.importableCount).toBe(2);

    await act(async () => {
      await expect(result.current.importLegacyPeople()).rejects.toThrow("Second import failed");
    });

    expect(localStorage.getItem("pass7-mobile-clients-v1")).toBe(raw);
    expect(legacyImportWasHandled(localStorage, authValue.user!.id)).toBe(false);
    expect(result.current.people).toEqual([firstCreated]);
    expect(result.current.legacyOffer).toMatchObject({ importableCount: 1, duplicateCount: 1 });
  });

  it("ignores a delayed load from the previous account", async () => {
    let resolveUserA!: (people: Client[]) => void;
    const userALoad = new Promise<Client[]>((resolve) => { resolveUserA = resolve; });
    const repo = repository({
      listPeople: vi.fn()
        .mockImplementationOnce(() => userALoad)
        .mockResolvedValueOnce([]),
    });
    const { result, rerender } = renderHook(() => usePeople(repo), { wrapper });
    expect(result.current.loading).toBe(true);

    currentAuthValue = {
      ...authValue,
      user: { id: "2ba89886-689d-47a5-909a-0b1f9d75a42f", email: "second@example.com" },
    } as unknown as AuthContextValue;
    rerender();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.people).toEqual([]);

    await act(async () => {
      resolveUserA([person]);
      await userALoad;
    });
    expect(result.current.people).toEqual([]);
  });
});
