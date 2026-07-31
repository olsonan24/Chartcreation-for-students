# Aionis Formula Contract

## Contents

1. Provenance
2. Primitive operations
3. Summary report
4. Year cycles
5. Month cycles
6. Edge behavior

## Provenance

The approved implementation is `../assets/reference-engine/numerology.ts`.

Approved SHA-256:

```text
F7A0965F01AA4410BB38CEF05FF832F51A5EAFF6CC2E8E10238DB79EF7E5644A
```

This engine was ported from the recovered PASS 7 C# `Numerology` and `Report` classes. Use this document to understand the implementation, not to replace it.

## Primitive Operations

### Character values

- Uppercase letters contribute their alphabet position: A=1 through Z=26.
- Digits contribute face value.
- Other characters contribute zero.
- `letters(name)` converts each letter to its reduced 1-9 value, preserves digits, and turns other characters into spaces.

### Reduction

Normal positive reduction:

```text
result = input mod 9
if result is 0, return 9
```

Nonpositive numeric input returns 0. A single-round reduction sums the decimal digits once without repeating to one digit.

### Full compound trail

`full(input)`:

1. Calculate one digit-sum round.
2. Append that value and `/` while it has more than one digit.
3. Repeat using the digits of the prior value.
4. Append the final one-digit value.
5. Return an empty string when the result is zero.

Example: `full("Roman Peter Vaughan")` is `199/19/10/1`.

`multiFull(input)` applies `full` separately to parts split on space, `-`, `/`, or `\`, then preserves alignment with spaces.

### Vowel/HDC row

Vowels are A, E, I, O, U. For each name character, emit its reduced number when it is a vowel and a space otherwise. `hdcTotal` is the full compound trail of that spaced row.

### Repeated names

Repeat every character by its reduced value. A letter with value 1 occurs once; a letter with value 9 occurs nine times. Concatenate each name part independently.

### Combine

For each aligned position:

```text
value = (reduce(A[position]) + reduce(B[position])) mod 9
emit 9 when value is 0
```

Stop at the shorter input length.

## Summary Report

For `Report(fullName, dob, chartYear)`:

- `fullName`: normalized full birth name.
- `dob`: validated `DD/MM/YYYY`.
- `age`: `chartYear - birthYear`; do not adjust for birthday.
- `hdc`: aligned vowel-number row.
- `hdcTotal`: compound trail of `hdc`.
- `fullLetters`: reduced character row of the full name.
- `fullLettersTotal`: compound trail of the complete name-number row.
- `fullLettersTotalPart`: one aligned compound trail per name part.
- `pmei`: four occurrence groups calculated from `fullLetters`:
  - P = counts of 4 and 5, then reduce their sum.
  - M = counts of 1 and 8, then reduce their sum.
  - E = counts of 2, 3, and 6, then reduce their sum.
  - I = counts of 7 and 9, then reduce their sum.
- `birthForce`: aligned compound trails of day, month, and year followed by the compound trail of the complete DOB.
- `seasons`: let `transition = 36 - reduce(dob)`:
  - `0 ~ transition`
  - `transition+1 ~ transition+9`
  - `transition+10 ~ transition+18`
  - `transition+19 ~~`
- `pin`: recovered pinnacle sequence.
- `cha`: recovered challenge sequence.
- `ultimateGoal`: `full(fullLetters + dob)`.

### Pinnacles and challenges

Although the DOB is displayed as day/month/year, the recovered formula assigns:

```text
month = reduce(second DOB part)
day   = reduce(first DOB part)
year  = reduce(third DOB part)

P1 = reduce(month + day)
P2 = reduce(day + year)
P3 = reduce(P1 + P2)
P4 = reduce(month + year)

C1 = abs(month - day)
C2 = abs(day - year)
C3 = abs(C1 - C2)
C4 = abs(month - year)
```

Display pinnacle as `P1P2P3-P4` and challenge as `C1C2C3-C4`.

## Year Cycles

### Essence

For `getEssence(start, length)`:

1. Create `length` zero values.
2. When `start` is zero, reserve output position zero and begin source indexing at age one.
3. For every repeated name part, begin at `start - 1`, wrapping through that part independently.
4. Add aligned values from all name parts.
5. Reduce each sum to 1-9.

At timeline start zero, the first essence character is `0`.

### Personal year

Initial value:

```text
reduce(reduce(dob) + start)
```

Emit `length` values, incrementing and wrapping 9 to 1.

### Calendar year

Initial value:

```text
reduce(reduce(birthYearString) + start)
```

Emit `length` values, incrementing and wrapping 9 to 1.

### Name rows

Each name part cycles through its repeated-name string. For `start = 0`, begin the row with one literal space. Otherwise use offset `start - 1`. Wrap until the requested length is filled, then uppercase.

### Combined row

Combine Essence and Personal Year. At `start = 0`, replace the first character with `/`.

`getYearSet(start, length)` returns:

```text
names[]
essence
combined
personalYear
calendarYear
```

## Month Cycles

For `getMonthSet(ageOffset)`:

```text
monthCycle = "123456789123"
essence = essence-at-offset repeated 12 times
personalYear = personal-year-at-offset repeated 12 times
personalMonth = combine(personalYear, monthCycle)
personalMonthEssence = combine(personalMonth, essence)
combined = combine(personalMonthEssence, personalMonth)
```

Return five 12-character rows:

```text
essence
personalYear
personalMonth
personalMonthEssence
combined
```

## Edge Behavior

- Split name and DOB parts on space, hyphen, forward slash, or backslash.
- Empty or unsupported characters contribute zero but may preserve visual spacing.
- Negative start, length, or month offsets are invalid.
- The called name is display-only.
- Do not silently strip compound trails.
- Assert output lengths before rendering; presentation may pad or truncate only a copy.
