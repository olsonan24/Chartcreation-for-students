import assert from "node:assert/strict";
import test from "node:test";

import {
  BULGARIAN_ALPHABET,
  getAlphabetChartValue,
  getAlphabetPosition,
  rawAlphabetPositionTotal,
  validateNameAlphabet,
} from "../lib/name-alphabets.ts";
import {
  Report,
  calcNumber,
  calcString,
  combine,
  full,
  hdc,
  letters,
  pinCha,
  repeat,
} from "../lib/numerology.ts";

test("Latin behavior is the protected formula contract", () => {
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

test("defines every Bulgarian raw position and repeating 1-9 chart value", () => {
  assert.equal(BULGARIAN_ALPHABET.length, 30);
  BULGARIAN_ALPHABET.forEach((letter, index) => {
    const expectedPosition = index + 1;
    assert.equal(getAlphabetPosition(letter, "bulgarian-cyrillic"), expectedPosition);
    assert.equal(
      getAlphabetChartValue(letter, "bulgarian-cyrillic"),
      ((expectedPosition - 1) % 9) + 1,
    );
  });

  assert.equal(getAlphabetPosition("А", "bulgarian-cyrillic"), 1);
  assert.equal(getAlphabetPosition("Й", "bulgarian-cyrillic"), 10);
  assert.equal(getAlphabetPosition("К", "bulgarian-cyrillic"), 11);
  assert.equal(getAlphabetPosition("Ъ", "bulgarian-cyrillic"), 27);
  assert.equal(getAlphabetPosition("Я", "bulgarian-cyrillic"), 30);
  assert.deepEqual(
    ["Й", "К", "Л", "Н", "Р", "С", "Ъ", "Я"].map((letter) =>
      getAlphabetChartValue(letter, "bulgarian-cyrillic")),
    [1, 2, 3, 5, 8, 9, 9, 3],
  );
});

test("validates each alphabet without transliteration or lookalike substitution", () => {
  assert.equal(validateNameAlphabet("Александър Анков Котзев", "bulgarian-cyrillic").isValid, true);
  assert.equal(validateNameAlphabet("александър-анков’котзев", "bulgarian-cyrillic").isValid, true);
  assert.equal(validateNameAlphabet("Alexander", "bulgarian-cyrillic").isValid, false);
  assert.equal(validateNameAlphabet("Александър", "latin").isValid, false);
  for (const unsupported of ["Ё", "Ы", "Э", "Є", "Ї", "І", "Њ", "Ѓ", "Ќ"]) {
    assert.equal(validateNameAlphabet(`А${unsupported}`, "bulgarian-cyrillic").isValid, false);
  }
});

test("calculates Bulgarian raw positions separately from visible chart digits", () => {
  const parts = [
    ["Александър", 112, "1362915598", "49/13/4"],
    ["Анков", 44, "15263", "17/8"],
    ["Котзев", 62, "261863", "26/8"],
  ];

  for (const [name, rawTotal, letterRow, visibleTotal] of parts) {
    assert.equal(rawAlphabetPositionTotal(name, "bulgarian-cyrillic"), rawTotal);
    assert.equal(calcString(name, true, "bulgarian-cyrillic"), rawTotal);
    assert.equal(letters(name, "bulgarian-cyrillic"), letterRow);
    assert.equal(full(letterRow), visibleTotal);
  }

  const fullName = "Александър Анков Котзев";
  const report = new Report(fullName, "02/09/1992", 2026, "bulgarian-cyrillic");
  assert.equal(rawAlphabetPositionTotal(fullName, "bulgarian-cyrillic"), 218);
  assert.equal(report.fullLetters, "1362915598 15263 261863");
  assert.equal(report.fullLettersTotal, "92/11/2");
  assert.deepEqual(report.fullLettersTotalPart.trim().split(/\s+/), ["49/13/4", "17/8", "26/8"]);
  assert.equal(report.hdcTotal, "36/9");
  assert.equal(full(hdc(fullName, 3, "bulgarian-cyrillic")), "36/9");
});

test("normalizes Bulgarian case and ignores supported visual separators numerically", () => {
  const uppercase = "АЛЕКСАНДЪР АНКОВ КОТЗЕВ";
  const lowercase = "александър анков котзев";
  const separated = "Александър-Анков’Котзев";
  assert.equal(letters(lowercase, "bulgarian-cyrillic"), letters(uppercase, "bulgarian-cyrillic"));
  assert.equal(
    letters(separated, "bulgarian-cyrillic").replaceAll(" ", ""),
    letters(uppercase, "bulgarian-cyrillic").replaceAll(" ", ""),
  );
  assert.equal(rawAlphabetPositionTotal(separated, "bulgarian-cyrillic"), 218);
});

test("uses Bulgarian letter durations in repeated names and valid timeline rows", () => {
  assert.equal(repeat("ЙКЛ", "bulgarian-cyrillic"), "ЙККЛЛЛ");
  const report = new Report("Александър Анков Котзев", "02/09/1992", 2026, "bulgarian-cyrillic");
  const focus = report.getYearSet(20, 30);
  const lifetime = report.getYearSet(0, 80);

  assert.equal(focus.names.length, 3);
  assert.match(focus.names.join(""), /[А-Я]/u);
  for (const row of [
    ...focus.names,
    focus.essence,
    focus.combined,
    focus.personalYear,
    focus.calendarYear,
  ]) assert.equal(row.length, 30);
  for (const row of [
    ...lifetime.names,
    lifetime.essence,
    lifetime.combined,
    lifetime.personalYear,
    lifetime.calendarYear,
  ]) assert.equal(row.length, 80);
});

test("keeps every date-only calculation independent of the selected name alphabet", () => {
  const latin = new Report("Alexander Joshua Olson", "02/09/1992", 2026);
  const bulgarian = new Report("Александър Анков Котзев", "02/09/1992", 2026, "bulgarian-cyrillic");
  assert.deepEqual(
    {
      age: bulgarian.age,
      birthForce: bulgarian.birthForce,
      seasons: bulgarian.seasons,
      pin: bulgarian.pin,
      cha: bulgarian.cha,
      personalYear: bulgarian.getPersonalYear(0, 80),
      calendarYear: bulgarian.getCalendarYear(0, 80),
    },
    {
      age: latin.age,
      birthForce: latin.birthForce,
      seasons: latin.seasons,
      pin: latin.pin,
      cha: latin.cha,
      personalYear: latin.getPersonalYear(0, 80),
      calendarYear: latin.getCalendarYear(0, 80),
    },
  );
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

  const lifetime = report.getYearSet(0, 80);
  assert.equal(lifetime.names.length, 3);
  assert.equal(lifetime.combined[0], "/");
  for (const row of [
    ...lifetime.names,
    lifetime.essence,
    lifetime.combined,
    lifetime.personalYear,
    lifetime.calendarYear,
  ]) {
    assert.equal(row.length, 80);
  }
});

test("matches the Alexander print-chart values and builds the 80-year footer", () => {
  const report = new Report("Alexander Joshua olson", "02/09/1992", 2026);
  assert.deepEqual(
    {
      hdc: report.hdc,
      hdcTotal: report.hdcTotal,
      fullLetters: report.fullLetters,
      fullLettersTotal: report.fullLettersTotal,
      fullLettersTotalPart: report.fullLettersTotalPart,
      pmei: report.pmei,
      birthForce: report.birthForce,
      pin: report.pin,
      cha: report.cha,
      ultimateGoal: report.ultimateGoal,
      seasons: report.seasons,
    },
    {
      hdc: "1 5 1  5   6  31 6  6 ",
      hdcTotal: "34/7",
      fullLetters: "135615459 161831 63165",
      fullLettersTotal: "80/8",
      fullLettersTotalPart: "39/12/3   20/2   21/3 ",
      pmei: ["1   4 = 5", "6   1 = 7", "0 3 4 = 7", "0   1 = 1"],
      birthForce: "2  9  21/3 32/5",
      pin: "257-3",
      cha: "716-6",
      ultimateGoal: "112/4",
      seasons: ["0 ~ 31", "32 ~ 40", "41 ~ 49", "50 ~~"],
    },
  );

  const lifetime = report.getYearSet(0, 80);
  assert.match(lifetime.names[0], /^ ALLLEEEEEXXXXXXANNNNNDDDDEEEEERRRRRRRRR/);
  assert.equal(lifetime.essence.length, 80);
  assert.equal(lifetime.combined.length, 80);
  assert.equal(lifetime.personalYear.length, 80);
  assert.equal(lifetime.calendarYear.length, 80);
});
