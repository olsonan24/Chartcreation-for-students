import test from "node:test";
import assert from "node:assert/strict";

import { generatedTypesMatch, normalizeGeneratedTypes } from "./verify-local-database.mjs";

// Keep normalization deliberately narrower than schema-aware formatting.

test("normalizes CRLF to LF and one trailing newline", () => {
  assert.equal(normalizeGeneratedTypes("one\r\ntwo\r\n"), "one\ntwo\n");
  assert.equal(generatedTypesMatch("one\ntwo", "one\r\ntwo\r\n"), true);
  assert.equal(generatedTypesMatch("one\ntwo\n", "one\r\ntwo\r\n\r\n"), true);
});

test("does not normalize multiple trailing newlines", () => {
  assert.equal(generatedTypesMatch("one\n", "one\n\n\n"), false);
});

test("detects material generated-type drift", () => {
  assert.equal(
    generatedTypesMatch("people: { Row: { name: string } }\n", "people: { Row: { name: string | null } }\n"),
    false,
  );
});
