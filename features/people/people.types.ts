import type { NameAlphabetMode } from "../../lib/name-alphabets";

export type Client = {
  id: string;
  fullName: string;
  calledName: string;
  dob: string;
  nameAlphabetMode: NameAlphabetMode;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonInput = {
  fullName: string;
  calledName: string;
  dob: string;
  nameAlphabetMode: NameAlphabetMode;
};

export type LegacyClient = Partial<Client> & Record<string, unknown>;
