# Formula Guardrails

## Canonical Sources

- Current engine: `lib/numerology.ts`
- Original number rules: `reference/Pass7-Recreated/Pass/Numerology.cs`
- Original cycles/report: `reference/Pass7-Recreated/Pass/Report.cs`
- Original PDF composition: `reference/Pass7-Recreated/Pass/PdfDocument.cs`

Treat the C# files and approved golden fixtures as formula provenance. Presentation may evolve; calculation behavior may not drift accidentally.

## Preserved Rules

- Letters A-Z contribute 1-26; digits contribute face value; other characters are ignored.
- Normal reduction is modulo nine with nonzero multiples of nine returning 9.
- Single-round reduction performs one digit sum.
- `full()` preserves compound trails such as `199/19/10/1`; zero produces an empty string.
- Name separators are space, hyphen, slash, and backslash.
- PMEI groups are fixed: P=4+5, M=1+8, E=2+3+6, I=7+9.
- DOB is `DD/MM/YYYY`; pinnacle/challenge ordering deliberately maps month, day, and year as in the recovered source.
- Age equals current year minus birth year, without a birthday adjustment.
- Seasons begin at `36 - reduced DOB`.
- At timeline start zero, repeated names begin with a leading space, essence begins with zero, and combined begins with `/`.
- `calledName` is stored and displayed but does not affect calculations.

## Required Audit

1. Confirm whether `lib/numerology.ts` changed from the approved baseline.
2. If it changed, trace every altered branch against both recovered C# sources.
3. Run `node --test tests/numerology.test.mjs`.
4. Assert formula row lengths before rendering; the print component can pad or truncate.
5. Run `npm run lint` and `npm test`.
6. For print-affecting work, generate a real PDF and prove it is one A4 page.
7. Keep calculation changes separate from visual or print changes.

## Current Golden Fixtures

- Roman Peter Vaughan: full report, year set, month set, and lifetime-row lengths.
- Alexander Joshua Olson: print values and 80-year footer.

Recommended future fixtures include one-letter names, punctuation, leap dates, eight-part names, corrupted saved data, accent-only names, and ages at the 80-year boundary. Add them only after expected outputs are independently confirmed from the recovered implementation.
