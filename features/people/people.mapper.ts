import {
  isNameAlphabetMode,
  nameAlphabetValidationMessage,
  validateNameAlphabet,
} from "../../lib/name-alphabets";
import { isValidDob, normalizeName } from "../../lib/numerology";
import type { Tables } from "../../lib/supabase/database.types";
import type { Client, PersonInput } from "./people.types";

export type PeopleRow = Tables<"people">;

export class PersonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersonValidationError";
  }
}

export function appDobToDatabaseDate(dob: string): string {
  if (!isValidDob(dob)) {
    throw new PersonValidationError("Enter a valid date in DD/MM/YYYY format.");
  }

  const [day, month, year] = dob.split("/");
  return `${year}-${month}-${day}`;
}

export function databaseDateToAppDob(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new PersonValidationError("The saved date of birth is invalid.");
  }

  const dob = `${match[3]}/${match[2]}/${match[1]}`;
  if (!isValidDob(dob)) {
    throw new PersonValidationError("The saved date of birth is invalid.");
  }
  return dob;
}

export function normalizePersonInput(input: PersonInput): PersonInput {
  const nameAlphabetMode = isNameAlphabetMode(input.nameAlphabetMode)
    ? input.nameAlphabetMode
    : "latin";
  const fullName = normalizeName(input.fullName, nameAlphabetMode);
  const calledName = normalizeName(input.calledName, nameAlphabetMode);

  if (!fullName) {
    throw new PersonValidationError("Enter the full birth name used for the chart.");
  }
  if (fullName.length > 200 || calledName.length > 200) {
    throw new PersonValidationError("Names must be 200 characters or fewer.");
  }
  if (!validateNameAlphabet(fullName, nameAlphabetMode).isValid) {
    throw new PersonValidationError(nameAlphabetValidationMessage(nameAlphabetMode));
  }
  if (calledName && !validateNameAlphabet(calledName, nameAlphabetMode).isValid) {
    throw new PersonValidationError(nameAlphabetValidationMessage(nameAlphabetMode));
  }

  appDobToDatabaseDate(input.dob);
  return { fullName, calledName, dob: input.dob, nameAlphabetMode };
}

export function mapPeopleRow(row: PeopleRow): Client {
  return {
    id: row.id,
    fullName: row.full_name,
    calledName: row.called_name,
    dob: databaseDateToAppDob(row.date_of_birth),
    nameAlphabetMode: isNameAlphabetMode(row.name_alphabet_mode) ? row.name_alphabet_mode : "latin",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function personDuplicateKey(input: PersonInput): string {
  const normalized = normalizePersonInput(input);
  return [
    normalized.fullName.toLocaleLowerCase("en-US"),
    normalized.calledName.toLocaleLowerCase("en-US"),
    appDobToDatabaseDate(normalized.dob),
    normalized.nameAlphabetMode,
  ].join("|");
}
