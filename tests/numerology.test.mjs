import assert from "node:assert/strict";
import test from "node:test";

import {
  Report,
  calcNumber,
  calcString,
  combine,
  full,
  letters,
  pinCha,
} from "../lib/numerology.ts";

test("matches the original reduction rules", () => {
  assert.equal(calcString("Z"), 8);
  assert.equal(calcString("Roman Peter Vaughan"), 1);
  assert.equal(calcString("82", true), 10);
  assert.equal(calcNumber(18), 9);
  assert.equal(full("Roman Peter Vaughan"), "199/19/10/1");
  assert.equal(letters("Roman Peter Vaughan"), "96415 75259 4137815");
  assert.equal(pinCha("24/05/1992", "PPP_P"), "292-8");
  assert.equal(pinCha("24/05/1992", "CCC_C"), "132-2");
  assert.equal(combine("1555322228", "3456789123"), "4912112342");
});

test("matches the original Roman Peter Vaughan report exactly", () => {
  const report = new Report("Roman Peter Vaughan", "24/05/1992", 2026);
  assert.deepEqual(
    {
      age: report.age,
      hdc: report.hdc,
      hdcTotal: report.hdcTotal,
      fullLetters: report.fullLetters,
      fullLettersTotal: report.fullLettersTotal,
      fullLettersTotalPart: report.fullLettersTotalPart,
      pmei: report.pmei,
      birthForce: report.birthForce,
      seasons: report.seasons,
      pin: report.pin,
      cha: report.cha,
      ultimateGoal: report.ultimateGoal,
    },
    {
      age: 34,
      hdc: " 6 1   5 5   13  1 ",
      hdcTotal: "22/4",
      fullLetters: "96415 75259 4137815",
      fullLettersTotal: "82/10/1",
      fullLettersTotalPart: "25/7  /10/1 29/11/2",
      pmei: ["2   4 = 6", "3   1 = 4", "1 1 1 = 3", "2   2 = 4"],
      birthForce: "6  5  21/3 32/5",
      seasons: ["0 ~ 31", "32 ~ 40", "41 ~ 49", "50 ~~"],
      pin: "292-8",
      cha: "132-2",
      ultimateGoal: "114/6",
    },
  );

  assert.deepEqual(report.getYearSet(25, 20), {
    names: [
      "NRRRRRRRRROOOOOOMMMM",
      "RRRRPPPPPPPEEEEETTEE",
      "NNNNNVVVVAUUUGGGGGGG",
    ],
    essence: "15553222287559994477",
    combined: "49121123422127895612",
    personalYear: "34567891234567891234",
    calendarYear: "12345678912345678912",
  });

  assert.deepEqual(report.getMonthSet(34), {
    essence: "888888888888",
    personalYear: "333333333333",
    personalMonth: "456789123456",
    personalMonthEssence: "345678912345",
    combined: "792468135792",
  });
});
