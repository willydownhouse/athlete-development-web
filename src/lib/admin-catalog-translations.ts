import type { CatalogTranslations, CatalogTranslationsPatch } from "./types";

export function catalogNameTranslationsFromForm(
  nameFi: string,
  mode: "create",
): CatalogTranslations | undefined;
export function catalogNameTranslationsFromForm(
  nameFi: string,
  mode: "update",
): CatalogTranslationsPatch;
export function catalogNameTranslationsFromForm(
  nameFi: string,
  mode: "create" | "update",
): CatalogTranslations | CatalogTranslationsPatch | undefined {
  const name = nameFi.trim();

  if (name !== "") {
    return { fi: { name } };
  }

  if (mode === "update") {
    return { fi: null };
  }

  return undefined;
}

export function catalogMetricTranslationsFromForm(
  nameFi: string,
  descriptionFi: string,
  mode: "create",
): CatalogTranslations | undefined;
export function catalogMetricTranslationsFromForm(
  nameFi: string,
  descriptionFi: string,
  mode: "update",
): CatalogTranslationsPatch;
export function catalogMetricTranslationsFromForm(
  nameFi: string,
  descriptionFi: string,
  mode: "create" | "update",
): CatalogTranslations | CatalogTranslationsPatch | undefined {
  const name = nameFi.trim();
  const description = descriptionFi.trim();

  if (name !== "") {
    return {
      fi: description === "" ? { name } : { name, description },
    };
  }

  if (mode === "update") {
    return { fi: null };
  }

  return undefined;
}
