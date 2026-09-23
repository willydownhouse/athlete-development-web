import { describe, expect, it } from "vitest";

import { formatEventCategoryLabel, formatEventIntensityLabel } from "./enum-labels";

describe("formatEventCategoryLabel", () => {
  it("returns English labels", () => {
    expect(formatEventCategoryLabel("training", "en")).toBe("Training");
    expect(formatEventCategoryLabel("competition", "en")).toBe("Competition");
  });

  it("returns Finnish labels", () => {
    expect(formatEventCategoryLabel("training", "fi")).toBe("Harjoittelu");
    expect(formatEventCategoryLabel("competition", "fi")).toBe("Kilpailu");
    expect(formatEventCategoryLabel("note", "fi")).toBe("Muistiinpano");
    expect(formatEventCategoryLabel("other", "fi")).toBe("Muu");
  });
});

describe("formatEventIntensityLabel", () => {
  it("returns English labels", () => {
    expect(formatEventIntensityLabel("light", "en")).toBe("Light");
    expect(formatEventIntensityLabel("moderate", "en")).toBe("Moderate");
    expect(formatEventIntensityLabel("hard", "en")).toBe("Hard");
  });

  it("returns Finnish labels", () => {
    expect(formatEventIntensityLabel("light", "fi")).toBe("Kevyt");
    expect(formatEventIntensityLabel("moderate", "fi")).toBe("Kohtalainen");
    expect(formatEventIntensityLabel("hard", "fi")).toBe("Kova");
  });
});
