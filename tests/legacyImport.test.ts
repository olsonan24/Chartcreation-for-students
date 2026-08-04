import { beforeEach, describe, expect, it } from "vitest";

import {
  inspectLegacyPeople,
  legacyImportWasHandled,
  markLegacyImportHandled,
  planLegacyImport,
} from "../features/people/legacyImport";

describe("legacy local-data import", () => {
  beforeEach(() => localStorage.clear());

  it("validates every record without modifying the original local value", () => {
    const raw = JSON.stringify([
      { id: "legacy-1", fullName: " Roman  Peter Vaughan ", calledName: "", dob: "24/05/1992" },
      { id: "legacy-2", fullName: "Bad Date", calledName: "", dob: "31/02/2020" },
    ]);
    localStorage.setItem("pass7-mobile-clients-v1", raw);

    const result = inspectLegacyPeople(localStorage.getItem("pass7-mobile-clients-v1"));
    expect(result.valid).toEqual([{ fullName: "Roman Peter Vaughan", calledName: "", dob: "24/05/1992" }]);
    expect(result.invalidCount).toBe(1);
    expect(localStorage.getItem("pass7-mobile-clients-v1")).toBe(raw);
  });

  it("reports malformed JSON and leaves it untouched", () => {
    localStorage.setItem("pass7-mobile-clients-v1", "{not-json");
    expect(inspectLegacyPeople(localStorage.getItem("pass7-mobile-clients-v1"))).toEqual({
      valid: [],
      invalidCount: 0,
      parseError: true,
    });
    expect(localStorage.getItem("pass7-mobile-clients-v1")).toBe("{not-json");
  });

  it("prevents duplicates against cloud records and within the legacy batch", () => {
    const existing = [{ id: "1", fullName: "Roman Peter Vaughan", calledName: "", dob: "24/05/1992" }];
    const plan = planLegacyImport([
      { fullName: " roman peter vaughan ", calledName: "", dob: "24/05/1992" },
      { fullName: "New Person", calledName: "New", dob: "01/01/2000" },
      { fullName: "new person", calledName: "new", dob: "01/01/2000" },
    ], existing);

    expect(plan.importable).toEqual([{ fullName: "New Person", calledName: "New", dob: "01/01/2000" }]);
    expect(plan.duplicateCount).toBe(2);
  });

  it("uses an account-specific one-time handled marker without deleting legacy data", () => {
    localStorage.setItem("pass7-mobile-clients-v1", "[]");
    expect(legacyImportWasHandled(localStorage, "user-a")).toBe(false);
    markLegacyImportHandled(localStorage, "user-a", "skipped");
    expect(legacyImportWasHandled(localStorage, "user-a")).toBe(true);
    expect(legacyImportWasHandled(localStorage, "user-b")).toBe(false);
    expect(localStorage.getItem("pass7-mobile-clients-v1")).toBe("[]");
  });
});
