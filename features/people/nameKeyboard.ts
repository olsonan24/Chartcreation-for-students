export type NameKeyboardKey =
  | string
  | "Space"
  | "Hyphen"
  | "Apostrophe"
  | "Backspace"
  | "Clear";

export type NameKeyboardResult = {
  value: string;
  caret: number;
};

function clampSelection(value: string, position: number): number {
  return Math.max(0, Math.min(value.length, position));
}

export function applyNameKeyboardKey(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  key: NameKeyboardKey,
): NameKeyboardResult {
  const start = clampSelection(value, selectionStart);
  const end = clampSelection(value, Math.max(selectionStart, selectionEnd));

  if (key === "Clear") return { value: "", caret: 0 };
  if (key === "Backspace") {
    if (end > start) return { value: value.slice(0, start) + value.slice(end), caret: start };
    if (start === 0) return { value, caret: 0 };
    const before = Array.from(value.slice(0, start));
    before.pop();
    const prefix = before.join("");
    return { value: prefix + value.slice(start), caret: prefix.length };
  }

  const insertion = key === "Space"
    ? " "
    : key === "Hyphen"
      ? "-"
      : key === "Apostrophe"
        ? "'"
        : key;
  const nextValue = value.slice(0, start) + insertion + value.slice(end);
  return { value: nextValue, caret: start + insertion.length };
}
