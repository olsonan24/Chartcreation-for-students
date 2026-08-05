import { describe, expect, it } from "vitest";

import { buildPersonReport } from "../features/people/personReport";
import type { Client } from "../features/people/people.types";

describe("saved person report construction", () => {
  it("uses each person's saved alphabet mode in selected and comparison reports", () => {
    const latin: Client = {
      id: "latin",
      fullName: "Alexander Joshua Olson",
      calledName: "Alexander",
      dob: "02/09/1992",
      nameAlphabetMode: "latin",
    };
    const bulgarian: Client = {
      id: "bulgarian",
      fullName: "Александър Анков Котзев",
      calledName: "Александър",
      dob: "02/09/1992",
      nameAlphabetMode: "bulgarian-cyrillic",
    };

    const reports = [latin, bulgarian].map((person) => buildPersonReport(person, 2026));
    expect(reports.map((report) => report.alphabetMode)).toEqual(["latin", "bulgarian-cyrillic"]);
    expect(reports.map((report) => report.fullLettersTotal)).toEqual(["80/8", "92/11/2"]);
    expect(reports[1].getYearSet(20, 21).names.join("")).toMatch(/[А-Я]/u);
  });
});
