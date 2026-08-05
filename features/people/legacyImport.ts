import { normalizePersonInput, personDuplicateKey, PersonValidationError } from "./people.mapper";
import type { Client, LegacyClient, PersonInput } from "./people.types";

export const LEGACY_STORAGE_KEY = "pass7-mobile-clients-v1";
const LEGACY_IMPORT_STATUS_PREFIX = "aionis-legacy-import-v1";

export type LegacyImportInspection = {
  valid: PersonInput[];
  invalidCount: number;
  parseError: boolean;
};

export type LegacyImportPlan = {
  importable: PersonInput[];
  duplicateCount: number;
};

export function inspectLegacyPeople(raw: string | null): LegacyImportInspection {
  if (!raw) return { valid: [], invalidCount: 0, parseError: false };

  let records: unknown;
  try {
    records = JSON.parse(raw);
  } catch {
    return { valid: [], invalidCount: 0, parseError: true };
  }
  if (!Array.isArray(records)) {
    return { valid: [], invalidCount: 1, parseError: false };
  }

  const valid: PersonInput[] = [];
  let invalidCount = 0;
  for (const record of records as LegacyClient[]) {
    try {
      if (!record || typeof record !== "object") throw new PersonValidationError("Invalid record.");
      if (typeof record.fullName !== "string" || typeof record.dob !== "string") {
        throw new PersonValidationError("Invalid record.");
      }
      valid.push(normalizePersonInput({
        fullName: record.fullName,
        calledName: typeof record.calledName === "string" ? record.calledName : "",
        dob: record.dob,
        nameAlphabetMode: "latin",
      }));
    } catch {
      invalidCount += 1;
    }
  }
  return { valid, invalidCount, parseError: false };
}

export function planLegacyImport(legacy: PersonInput[], existing: Client[]): LegacyImportPlan {
  const seen = new Set(existing.map(personDuplicateKey));
  const importable: PersonInput[] = [];
  let duplicateCount = 0;

  for (const person of legacy) {
    const key = personDuplicateKey(person);
    if (seen.has(key)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(key);
    importable.push(person);
  }
  return { importable, duplicateCount };
}

export function legacyImportStatusKey(userId: string): string {
  return `${LEGACY_IMPORT_STATUS_PREFIX}:${userId}`;
}

export function legacyImportWasHandled(storage: Storage, userId: string): boolean {
  return storage.getItem(legacyImportStatusKey(userId)) !== null;
}

export function markLegacyImportHandled(storage: Storage, userId: string, status: "imported" | "skipped"): void {
  storage.setItem(legacyImportStatusKey(userId), status);
}
