import messages from "../../messages/en.json";

export type ValidationMessages = {
  titleMaxLength: (max: number) => string;
  notesMaxLength: (max: number) => string;
  fieldRequired: (name: string) => string;
  wholeNumbers: (name: string) => string;
  mustBeNumber: (name: string) => string;
};

// Bridges next-intl's strictly typed translators into shared helpers.
type AnyTranslator = (key: never, values?: never) => string;

function formatTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function createValidationTranslator(
  source: (typeof messages)["validation"],
): (key: string, values?: Record<string, string | number>) => string {
  return (key, values) => formatTemplate(source[key as keyof typeof source], values ?? {});
}

export function createValidationMessages(t: AnyTranslator): ValidationMessages {
  return {
    titleMaxLength: (max) => t("titleMaxLength" as never, { max } as never),
    notesMaxLength: (max) => t("notesMaxLength" as never, { max } as never),
    fieldRequired: (name) => t("fieldRequired" as never, { name } as never),
    wholeNumbers: (name) => t("wholeNumbers" as never, { name } as never),
    mustBeNumber: (name) => t("mustBeNumber" as never, { name } as never),
  };
}

export function getDefaultValidationMessages(): ValidationMessages {
  return createValidationMessages(createValidationTranslator(messages.validation) as AnyTranslator);
}
