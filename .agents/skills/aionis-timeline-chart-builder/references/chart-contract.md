# Aionis Chart Contract

## Contents

1. Shared data rule
2. Summary
3. Focus timeline
4. Monthly timeline
5. Lifetime timeline
6. Pattern comparison
7. Responsive and print requirements

## Shared Data Rule

Create one `Report` for the selected person and chart year. Screen, phone, comparison, and print must consume that report or its `getYearSet`/`getMonthSet` results. Never duplicate formulas in UI code.

## Summary

Display:

1. Vowel/HDC number row and compound total.
2. Full birth name.
3. Name-number groups, full-name total, and one centered reduction beneath each corresponding name group.
4. P, M, E, and I occurrence groups.
5. DOB and birth-force trails.
6. Pinnacle and challenge sequences.
7. Age and four seasons.
8. Chart date and Ultimate Goal.

Use a monospaced font for aligned data. Preserve spaces in HDC, name groups, and compound trails.

## Focus Timeline

Use:

```text
start = max(0, age - 14)
length = 30
```

Render in this order:

1. Current-age `*` marker.
2. Age tens.
3. Age ones.
4. One repeated-name row per name part.
5. Exactly two dotted `:` rows.
6. Essence, label `ESS`.
7. Combined, label `COM`.
8. Personal Year, label `PY`.
9. Calendar Year, label `CY`.

## Monthly Timeline

Show the previous, selected/current, and following ages. Concatenate each set of 12 months into a 36-character row.

Render:

1. Essence, `ESS`.
2. Personal Month Essence, `PME`.
3. Monthly Combined, `MCOM`.
4. Personal Month, `PM`.
5. Calendar month initials `JFMAMJJASOND`, `CM`.
6. Personal Year, `PY`.
7. The three corresponding calendar years.

For a negative age, use twelve dots rather than calling the engine.

## Lifetime Timeline

Use `getYearSet(0, 80)`.

Render:

1. Age tens.
2. Age ones.
3. One repeated-name row per name part.
4. Exactly two dotted `:` rows.
5. Essence, `ESS`.
6. Combined, `COM`.
7. Personal Year, `PY`.
8. Calendar Year, `CY`.

Preserve the leading spaces, `0`, and `/` produced at age zero.

## Data Colors

Keep chart values distinguishable:

- black: headings and age markers;
- red: names, dots, monthly Essence, and monthly Personal Year;
- blue: Essence, Personal Year, Personal Month Essence, and Personal Month;
- cyan: Combined and Monthly Combined;
- green: Calendar Year and calendar months.

Decorative branding may change, but never recolor values so categories become ambiguous.

## Pattern Comparison

Calculate every person independently. To compare a calendar year:

```text
birthYear = chartYear - report.age
ageAtFocus = focusCalendarYear - birthYear
```

Align people by calendar year, not by array index from unrelated starting ages. Compare the same row types and cite exact ages/months. Do not mathematically combine two people unless a separate, approved formula defines that operation.

## Responsive Requirements

- Use the same complete report on phone and desktop.
- Allow horizontal scrolling inside dense timeline panels.
- Never create document-level horizontal overflow.
- Keep ordinary vertical document scrolling enabled.
- Keep touch targets at least 44×44 CSS pixels.
- Do not rasterize chart text; values must remain selectable and accessible.
- Preserve raw row strings outside rendering. Apply padding/truncation only to a display copy.

## A4 Report Requirements

- A4 portrait, 210 mm wide.
- Maximum content height: 287 mm.
- Canonical row structure: `34mm 42mm 58mm 46mm 82mm 1fr`.
- Include summary, 30-year focus, three-year monthly section, 80-year lifetime section, and footer.
- Keep name-part reductions centered under their number groups.
- Use exactly two dotted rows in the focus section and two in the lifetime section.
- Generate a real browser PDF.
- Confirm exactly one page, no clipping, and matching screen/print formula text.
