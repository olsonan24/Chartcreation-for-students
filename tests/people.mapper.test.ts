import { describe, expect, it } from "vitest";

import {
  appDobToDatabaseDate,
  databaseDateToAppDob,
  mapPeopleRow,
  normalizePersonInput,
  PersonValidationError,
} from "../features/people/people.mapper";

describe("people mapper", () => {
  it("converts DD/MM/YYYY to and from a PostgreSQL date without timezone drift", () => {
    expect(appDobToDatabaseDate("29/02/2024")).toBe("2024-02-29");
    expect(databaseDateToAppDob("2024-02-29")).toBe("29/02/2024");
  });

  it("rejects malformed and impossible dates", () => {
    expect(() => appDobToDatabaseDate("31/02/2024")).toThrow(PersonValidationError);
    expect(() => databaseDateToAppDob("2024/02/29")).toThrow(PersonValidationError);
  });

  it("normalizes source input and maps a generated database row", () => {
    expect(normalizePersonInput({ fullName: "  Roman   Peter Vaughan ", calledName: " Roman  Vaughan ", dob: "24/05/1992" })).toEqual({
      fullName: "Roman Peter Vaughan",
      calledName: "Roman Vaughan",
      dob: "24/05/1992",
    });
    expect(mapPeopleRow({
      id: "0ad275b0-818f-4424-87eb-a3089fa458ff",
      user_id: "84662d76-271b-40c8-9ce7-29fb621efe56",
      full_name: "Roman Peter Vaughan",
      called_name: "",
      date_of_birth: "1992-05-24",
      created_at: "2026-07-31T00:00:00Z",
      updated_at: "2026-07-31T00:00:00Z",
    })).toMatchObject({
      id: "0ad275b0-818f-4424-87eb-a3089fa458ff",
      fullName: "Roman Peter Vaughan",
      calledName: "",
      dob: "24/05/1992",
    });
  });
});
