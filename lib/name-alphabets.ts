export type NameAlphabetMode = "latin" | "bulgarian-cyrillic";

export interface NameAlphabetDefinition {
  id: NameAlphabetMode;
  letters: readonly string[];
  vowels: ReadonlySet<string>;
  getPosition(character: string): number | null;
  getChartValue(character: string): number | null;
  isSupportedLetter(character: string): boolean;
  isVowel(character: string): boolean;
}

export const LATIN_ALPHABET = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
export const BULGARIAN_ALPHABET = Array.from("АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ");

const LATIN_VOWELS = new Set(["A", "E", "I", "O", "U"]);
const BULGARIAN_VOWELS = new Set(["А", "Е", "И", "О", "У", "Ъ", "Ю", "Я"]);
const BULGARIAN_VISUAL_SEPARATORS = new Set([" ", "-", "'", "’"]);

export const NAME_ALPHABET_LABELS: Record<NameAlphabetMode, string> = {
  latin: "English / Latin",
  "bulgarian-cyrillic": "Български / Кирилица",
};

export function isNameAlphabetMode(value: unknown): value is NameAlphabetMode {
  return value === "latin" || value === "bulgarian-cyrillic";
}

function normalizedCharacter(character: string): string {
  return character.normalize("NFC").toUpperCase();
}

function createAlphabetDefinition(
  id: NameAlphabetMode,
  letters: readonly string[],
  vowels: ReadonlySet<string>,
): NameAlphabetDefinition {
  const positions = new Map(letters.map((letter, index) => [letter, index + 1]));
  const getPosition = (character: string) => positions.get(normalizedCharacter(character)) ?? null;

  return {
    id,
    letters,
    vowels,
    getPosition,
    getChartValue(character) {
      const position = getPosition(character);
      return position === null ? null : ((position - 1) % 9) + 1;
    },
    isSupportedLetter(character) {
      return getPosition(character) !== null;
    },
    isVowel(character) {
      return vowels.has(normalizedCharacter(character));
    },
  };
}

const DEFINITIONS: Record<NameAlphabetMode, NameAlphabetDefinition> = {
  latin: createAlphabetDefinition("latin", LATIN_ALPHABET, LATIN_VOWELS),
  "bulgarian-cyrillic": createAlphabetDefinition(
    "bulgarian-cyrillic",
    BULGARIAN_ALPHABET,
    BULGARIAN_VOWELS,
  ),
};

export function getNameAlphabet(mode: NameAlphabetMode = "latin"): NameAlphabetDefinition {
  return DEFINITIONS[mode];
}

export function getAlphabetPosition(
  character: string,
  mode: NameAlphabetMode = "latin",
): number | null {
  return getNameAlphabet(mode).getPosition(character);
}

export function getAlphabetChartValue(
  character: string,
  mode: NameAlphabetMode = "latin",
): number | null {
  return getNameAlphabet(mode).getChartValue(character);
}

export function rawAlphabetPositionTotal(
  input: string,
  mode: NameAlphabetMode = "latin",
): number {
  let total = 0;
  for (const character of input.normalize("NFC")) {
    total += getAlphabetPosition(character, mode) ?? 0;
  }
  return total;
}

export type NameAlphabetValidation = {
  isValid: boolean;
  invalidCharacters: string[];
};

export function validateNameAlphabet(
  input: string,
  mode: NameAlphabetMode = "latin",
): NameAlphabetValidation {
  const definition = getNameAlphabet(mode);
  const invalidCharacters = new Set<string>();

  for (const character of input.normalize("NFC")) {
    if (definition.isSupportedLetter(character)) continue;
    if (character >= "0" && character <= "9") continue;
    if (mode === "bulgarian-cyrillic") {
      if (!BULGARIAN_VISUAL_SEPARATORS.has(character)) invalidCharacters.add(character);
      continue;
    }

    // Latin mode retains the legacy treatment of digits and punctuation while
    // rejecting letters from a different writing system instead of ignoring them.
    if (/\p{L}/u.test(character)) invalidCharacters.add(character);
  }

  return { isValid: invalidCharacters.size === 0, invalidCharacters: [...invalidCharacters] };
}

export function nameAlphabetValidationMessage(mode: NameAlphabetMode): string {
  return mode === "bulgarian-cyrillic"
    ? "This mode supports the 30-letter Bulgarian alphabet only."
    : "This mode supports English / Latin letters only.";
}
