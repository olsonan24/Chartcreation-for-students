import { describe, expect, it } from "vitest";

import { applyNameKeyboardKey } from "../features/people/nameKeyboard";

describe("Bulgarian virtual keyboard editing", () => {
  it("inserts at the current caret and restores the next caret position", () => {
    expect(applyNameKeyboardKey("Алексндър", 5, 5, "а")).toEqual({
      value: "Александър",
      caret: 6,
    });
  });

  it("replaces selected text", () => {
    expect(applyNameKeyboardKey("АлекZZндър", 4, 6, "са")).toEqual({
      value: "Александър",
      caret: 6,
    });
  });

  it("backspaces a selection or the character before the caret", () => {
    expect(applyNameKeyboardKey("АлексZZандър", 5, 7, "Backspace")).toEqual({
      value: "Александър",
      caret: 5,
    });
    expect(applyNameKeyboardKey("Алексаандър", 7, 7, "Backspace")).toEqual({
      value: "Александър",
      caret: 6,
    });
  });

  it("clears only the active field and supports every visual separator", () => {
    const fields = { fullName: "Александър", calledName: "Сашо" };
    const cleared = applyNameKeyboardKey(fields.calledName, 4, 4, "Clear");
    expect({ ...fields, calledName: cleared.value }).toEqual({
      fullName: "Александър",
      calledName: "",
    });
    expect(applyNameKeyboardKey("АлександърАнков", 10, 10, "Space").value).toBe("Александър Анков");
    expect(applyNameKeyboardKey("АннаМария", 4, 4, "Hyphen").value).toBe("Анна-Мария");
    expect(applyNameKeyboardKey("ДАртанян", 1, 1, "Apostrophe").value).toBe("Д'Артанян");
  });
});
