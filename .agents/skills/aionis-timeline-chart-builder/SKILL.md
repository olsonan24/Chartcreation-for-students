---
name: aionis-timeline-chart-builder
description: Build, reproduce, audit, explain, compare, or export complete Aionis Timeline Formula charts from a full birth name and DD/MM/YYYY date of birth. Use for Aionis or PASS 7 summary values, name-number trails, PMEI, birth force, pinnacles, challenges, seasons, ultimate goal, yearly name cycles, essence, combined, personal/calendar years, monthly rows, 80-year extended timelines, pattern analysis, responsive chart UIs, or one-page A4 reports. Preserve the bundled reference engine exactly and do not substitute conventional numerology rules.
---

# Aionis Timeline Chart Builder

Build every chart from the bundled approved engine. Treat presentation as adaptable and calculations as immutable.

## Load Only What the Task Needs

- Read [references/formula-contract.md](references/formula-contract.md) for any calculation, port, audit, mismatch, or explanation.
- Read [references/chart-contract.md](references/chart-contract.md) for chart composition, row ordering, responsive UI, comparison, or print/PDF work.
- Read [references/golden-fixtures.md](references/golden-fixtures.md) when validating a port or generated chart.
- Use [assets/reference-engine/numerology.ts](assets/reference-engine/numerology.ts) as the executable source of truth. Copy or wrap it; do not retype it from memory.

If only this `SKILL.md` is available, follow the exact calculation core and chart workflow below. Prefer the complete skill folder whenever possible because it includes the approved engine and executable fixtures.

## Required Inputs

Collect:

1. Full birth name.
2. Date of birth in `DD/MM/YYYY`.
3. Explicit chart year for reproducible output.
4. Optional called name for display only.

Normalize the full name by trimming it and collapsing spaces, hyphens, forward slashes, and backslashes to one space. Validate the date as a real calendar date. Do not use the called name in any calculation.

## Exact Calculation Core

Use A=1 through Z=26 and digit face values; ignore other characters. Normal positive reduction is modulo nine with a zero remainder returning 9. A single-round reduction sums decimal digits once. Build a compound trail by repeatedly applying one digit-sum round and joining every result with `/`; zero becomes an empty string.

Convert each name letter to its reduced 1-9 value while preserving separators as spaces. Calculate:

- HDC: emit reduced values only for A, E, I, O, and U at their original positions; total it with the compound-trail rule.
- Name totals: compound trail for the entire reduced name row and independently for each name part.
- P/M/E/I: count digits `4+5`, `1+8`, `2+3+6`, and `7+9`, respectively, then reduce each group sum.
- Birth Force: aligned compound trails for day, month, and year, then the complete DOB compound trail.
- Ultimate Goal: compound trail of the reduced full-name row concatenated with the DOB.
- Age: chart year minus birth year, without birthday adjustment.
- Seasons: let `t = 36 - reduce(DOB)`; emit `0~t`, `t+1~t+9`, `t+10~t+18`, and `t+19~~`.

For pinnacles and challenges, reduce the second DOB part as month, first part as day, and third part as year:

```text
P1=reduce(month+day)  P2=reduce(day+year)
P3=reduce(P1+P2)      P4=reduce(month+year)
C1=abs(month-day)     C2=abs(day-year)
C3=abs(C1-C2)         C4=abs(month-year)
```

Repeat every name character by its reduced value to form independent name-cycle strings.

For a year range:

- Essence: align every repeated-name string at `start-1`, wrap each independently, add vertically, and reduce each sum. At start zero, reserve the first output as `0` and begin source indexing at age one.
- Personal Year: start at `reduce(reduce(DOB)+start)`, increment, and wrap 9 to 1.
- Calendar Year: start at `reduce(reduce(birthYearString)+start)`, increment, and wrap 9 to 1.
- Name rows: at start zero prefix one literal space; otherwise begin at `start-1`; wrap and uppercase.
- Combined: positionally reduce Essence plus Personal Year; at start zero replace its first character with `/`.

For a month set at age offset:

```text
monthCycle = 123456789123
ESS  = one yearly Essence value repeated 12 times
PY   = one Personal Year value repeated 12 times
PM   = combine(PY, monthCycle)
PME  = combine(PM, ESS)
MCOM = combine(PME, PM)
```

Positionally `combine(a,b)` adds reduced aligned characters modulo nine and emits 9 for a zero remainder.

## Build Workflow

1. Instantiate `new Report(fullName, dob, chartYear)` from the bundled engine.
2. Render the summary from the `Report` fields without recomputing values in the UI.
3. Build the 30-year focus timeline:
   - `start = max(0, report.age - 14)`
   - `length = 30`
   - `report.getYearSet(start, length)`
4. Build the three-year monthly timeline:
   - ages `[report.age - 1, report.age, report.age + 1]`
   - call `report.getMonthSet(age)` for each nonnegative age
   - concatenate each matching 12-character row into 36 characters
5. Build the extended lifetime timeline:
   - `start = 0`
   - `length = 80`
   - `report.getYearSet(0, 80)`
6. Render screen and print from those same `Report` results.
7. Run the bundled verification and inspect the output at phone, desktop, and A4 print sizes.

## Pattern Analysis

Keep calculation and interpretation separate. First preserve the raw character rows, then derive observations without modifying them.

Report:

- repeated digits or letters and their exact age/month ranges;
- transitions where a row changes value;
- vertical alignments across Essence, Combined, Personal Year, and Calendar Year;
- alignments between name-cycle letters and number rows;
- recurrence intervals;
- current-age/current-year clusters;
- similarities and differences between separately calculated people aligned to the same calendar year.

Always cite the row and position that produced a pattern. Label observations as derived analysis, not formula output. Do not invent spiritual meanings or import another numerology system unless the user supplies a separate interpretation canon.

## Formula Safety

- Never replace compound trails such as `199/19/10/1` with a single digit.
- Never apply master-number preservation unless the bundled engine produces it.
- Never adjust age for whether the birthday has occurred; age is chart year minus birth year.
- Never swap the recovered month/day/year ordering used by pinnacle and challenge calculations.
- Never remove the special leading characters in the age-zero timeline.
- Never let formatting, clipping, or padding change source row values.
- If a requested formula change is intentional, isolate it as a fork and preserve the approved engine and fixtures.

## Validation

Run from this skill directory:

```text
node --test scripts/verify-engine.test.mjs
```

Before release, also:

- assert 30, 36, and 80-character row lengths;
- compare at least one complete output with [references/golden-fixtures.md](references/golden-fixtures.md);
- verify phone and desktop layouts have no document-level horizontal overflow;
- generate a real A4 PDF and confirm it is exactly one unclipped page;
- confirm screen and print values came from the same `Report`.

## Definition of Done

A chart is complete only when:

- all summary values and compound trails match the engine;
- every requested name part appears in the repeated-name rows;
- focus, monthly, and lifetime sections are present in the canonical order;
- name-part reductions are centered beneath their number groups;
- traditional chart data colors remain distinguishable;
- the layout works on phone and desktop;
- the A4 report is one page;
- golden fixtures pass without changing expected values.
