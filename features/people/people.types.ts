export type Client = {
  id: string;
  fullName: string;
  calledName: string;
  dob: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonInput = {
  fullName: string;
  calledName: string;
  dob: string;
};

export type LegacyClient = Partial<Client> & Record<string, unknown>;
