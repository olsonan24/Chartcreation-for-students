import { Report } from "../../lib/numerology";
import type { Client } from "./people.types";

export function buildPersonReport(client: Client, currentYear: number): Report {
  return new Report(client.fullName, client.dob, currentYear, client.nameAlphabetMode);
}
