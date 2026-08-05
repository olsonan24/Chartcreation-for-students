import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { createPeopleRepository, PeopleRepositoryError } from "../features/people/people.repository";
import type { Database } from "../lib/supabase/database.types";

const userId = "84662d76-271b-40c8-9ce7-29fb621efe56";

function authClient(from: ReturnType<typeof vi.fn>) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) },
    from,
  } as unknown as SupabaseClient<Database>;
}

describe("people repository", () => {
  it("derives ownership from the authenticated user and stores only normalized source data", async () => {
    let inserted: unknown;
    const createdRow = {
      id: "0ad275b0-818f-4424-87eb-a3089fa458ff",
      name_alphabet_mode: "bulgarian-cyrillic",
      user_id: userId,
      full_name: "Александър Анков Котзев",
      called_name: "Александър",
      date_of_birth: "1992-05-24",
      created_at: "2026-07-31T00:00:00Z",
      updated_at: "2026-07-31T00:00:00Z",
    };
    const chain = {
      insert: vi.fn((value: unknown) => { inserted = value; return chain; }),
      select: vi.fn(() => chain),
      single: vi.fn().mockResolvedValue({ data: createdRow, error: null }),
    };
    const repository = createPeopleRepository(authClient(vi.fn(() => chain)));

    const result = await repository.createPerson({
      fullName: "Александър Анков Котзев",
      calledName: "Александър",
      dob: "24/05/1992",
      nameAlphabetMode: "bulgarian-cyrillic",
    });

    expect(inserted).toEqual({
      user_id: userId,
      full_name: "Александър Анков Котзев",
      called_name: "Александър",
      date_of_birth: "1992-05-24",
      name_alphabet_mode: "bulgarian-cyrillic",
    });
    expect(result.dob).toBe("24/05/1992");
    expect(result.nameAlphabetMode).toBe("bulgarian-cyrillic");
  });

  it("propagates a useful typed list failure", async () => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn().mockResolvedValue({ data: null, error: { code: "42501" } }),
    };
    const repository = createPeopleRepository(authClient(vi.fn(() => chain)));

    await expect(repository.listPeople()).rejects.toMatchObject({
      name: "PeopleRepositoryError",
      operation: "list",
      causeCode: "42501",
    } satisfies Partial<PeopleRepositoryError>);
  });

  it("fails before querying when the authenticated user cannot be verified", async () => {
    const from = vi.fn();
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { code: "session_not_found" } }) },
      from,
    } as unknown as SupabaseClient<Database>;

    await expect(createPeopleRepository(client).listPeople()).rejects.toMatchObject({ operation: "authenticate" });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects a repository operation if the active account changed", async () => {
    const from = vi.fn();
    const client = authClient(from);
    const repository = createPeopleRepository(client, "2ba89886-689d-47a5-909a-0b1f9d75a42f");

    await expect(repository.listPeople()).rejects.toMatchObject({ operation: "authenticate" });
    expect(from).not.toHaveBeenCalled();
  });
});
