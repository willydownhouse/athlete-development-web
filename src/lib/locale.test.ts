import { describe, expect, it } from "vitest";

import { DEFAULT_APP_LOCALE, parseAcceptLanguage, parseAppLocale } from "./locale";

describe("parseAppLocale", () => {
  it("accepts English and Finnish", () => {
    expect(parseAppLocale("en")).toBe("en");
    expect(parseAppLocale("fi")).toBe("fi");
    expect(parseAppLocale(" FI ")).toBe("fi");
  });

  it("rejects unsupported values", () => {
    expect(parseAppLocale("sv")).toBeNull();
    expect(parseAppLocale("")).toBeNull();
    expect(parseAppLocale(undefined)).toBeNull();
  });
});

describe("parseAcceptLanguage", () => {
  it("defaults when the header is missing", () => {
    expect(parseAcceptLanguage(undefined)).toBe(DEFAULT_APP_LOCALE);
    expect(parseAcceptLanguage("")).toBe(DEFAULT_APP_LOCALE);
  });

  it("prefers Finnish when it has the highest quality", () => {
    expect(parseAcceptLanguage("fi")).toBe("fi");
    expect(parseAcceptLanguage("fi-FI,fi;q=0.9,en;q=0.8")).toBe("fi");
  });

  it("prefers English when it outranks Finnish", () => {
    expect(parseAcceptLanguage("en-US,en;q=0.9,fi;q=0.8")).toBe("en");
  });

  it("skips unsupported languages and uses the next supported tag", () => {
    expect(parseAcceptLanguage("sv,en;q=0.8")).toBe("en");
    expect(parseAcceptLanguage("sv,de")).toBe(DEFAULT_APP_LOCALE);
  });
});
