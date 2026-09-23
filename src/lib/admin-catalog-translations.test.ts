import { describe, expect, it } from "vitest";

import {
  catalogMetricTranslationsFromForm,
  catalogNameTranslationsFromForm,
} from "./admin-catalog-translations";

describe("catalogNameTranslationsFromForm", () => {
  it("omits translations on create when Finnish name is empty", () => {
    expect(catalogNameTranslationsFromForm("", "create")).toBeUndefined();
    expect(catalogNameTranslationsFromForm("   ", "create")).toBeUndefined();
  });

  it("sends Finnish name on create", () => {
    expect(catalogNameTranslationsFromForm(" Jääkiekko ", "create")).toEqual({
      fi: { name: "Jääkiekko" },
    });
  });

  it("clears Finnish on update when the name field is empty", () => {
    expect(catalogNameTranslationsFromForm("", "update")).toEqual({ fi: null });
  });

  it("replaces Finnish name on update", () => {
    expect(catalogNameTranslationsFromForm("Salibandy", "update")).toEqual({
      fi: { name: "Salibandy" },
    });
  });
});

describe("catalogMetricTranslationsFromForm", () => {
  it("omits translations on create when Finnish name is empty", () => {
    expect(catalogMetricTranslationsFromForm("", "Kuvaus", "create")).toBeUndefined();
  });

  it("sends Finnish name and optional description on create", () => {
    expect(catalogMetricTranslationsFromForm("Laukaukset", "", "create")).toEqual({
      fi: { name: "Laukaukset" },
    });
    expect(
      catalogMetricTranslationsFromForm("Laukaukset", " Laukaisujen määrä. ", "create"),
    ).toEqual({
      fi: { name: "Laukaukset", description: "Laukaisujen määrä." },
    });
  });

  it("clears Finnish on update when the name field is empty", () => {
    expect(catalogMetricTranslationsFromForm("", "Kuvaus", "update")).toEqual({ fi: null });
  });

  it("replaces the whole Finnish object on update", () => {
    expect(catalogMetricTranslationsFromForm("Laukaukset", "", "update")).toEqual({
      fi: { name: "Laukaukset" },
    });
  });
});
