import { describe, expect, it } from "vitest";

import { profileFieldInputValue, readChangedProfileFieldValues } from "./profile-field-form";
import type { AthleteProfileField } from "./types";

const position: AthleteProfileField = {
  id: "00000000-0000-4000-8000-000000000801",
  sportId: "00000000-0000-4000-8000-000000000001",
  key: "position",
  name: "Position",
  description: "Position on the ice.",
  valueType: "text",
  options: [{ value: "forward", name: "Forward" }],
  sortOrder: 10,
  value: { textValue: "forward", numericValue: null, booleanValue: null },
};

describe("profile field form values", () => {
  it("shows an empty answer and a numeric year without trailing zeros", () => {
    expect(profileFieldInputValue({ ...position, value: null })).toBe("");
    expect(
      profileFieldInputValue({
        ...position,
        id: "00000000-0000-4000-8000-000000000804",
        key: "started_year",
        valueType: "number",
        options: null,
        value: { textValue: null, numericValue: "2018.000", booleanValue: null },
      }),
    ).toBe("2018");
  });

  it("sends only changed answers and clears an emptied text field", () => {
    const formData = new FormData();
    formData.set("profileField:text:00000000-0000-4000-8000-000000000801", "defense");
    formData.set("profileFieldSaved:text:00000000-0000-4000-8000-000000000801", "forward");
    formData.set("profileField:text:00000000-0000-4000-8000-000000000803", "  ");
    formData.set("profileFieldSaved:text:00000000-0000-4000-8000-000000000803", "Kiekko-Laser");
    formData.set("profileField:number:00000000-0000-4000-8000-000000000804", "2018");
    formData.set("profileFieldSaved:number:00000000-0000-4000-8000-000000000804", "2018");

    expect(readChangedProfileFieldValues(formData)).toEqual({
      ok: true,
      values: [
        { profileFieldId: "00000000-0000-4000-8000-000000000801", textValue: "defense" },
        { profileFieldId: "00000000-0000-4000-8000-000000000803", textValue: null },
      ],
    });
  });

  it("rejects a number that is not finite", () => {
    const formData = new FormData();
    formData.set("profileField:number:00000000-0000-4000-8000-000000000804", "nope");
    formData.set("profileFieldSaved:number:00000000-0000-4000-8000-000000000804", "2018");

    expect(readChangedProfileFieldValues(formData)).toEqual({ ok: false, error: "invalidNumber" });
  });
});
