import messages from "../../messages/en.json";

export type DisplayMessages = {
  notSet: string;
  yes: string;
  no: string;
  durationHoursMinutes: (hours: number, minutes: number) => string;
  durationHours: (hours: number) => string;
  durationMinutesSeconds: (minutes: number, seconds: number) => string;
  durationMinutes: (minutes: number) => string;
  durationSeconds: (seconds: number) => string;
  durationMinutesShort: (minutes: number) => string;
};

type AnyTranslator = (key: never, values?: never) => string;

function formatTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function createCommonTranslator(
  source: (typeof messages)["common"],
): (key: string, values?: Record<string, string | number>) => string {
  return (key, values) => {
    if (key === "notSet" || key === "yes" || key === "no") {
      return source[key];
    }

    const [group, nestedKey] = key.split(".") as ["duration", keyof typeof source.duration];
    const template = source[group][nestedKey];
    return formatTemplate(template, values ?? {});
  };
}

export function createDisplayMessages(t: AnyTranslator): DisplayMessages {
  return {
    notSet: t("notSet" as never),
    yes: t("yes" as never),
    no: t("no" as never),
    durationHoursMinutes: (hours, minutes) =>
      t("duration.hoursMinutes" as never, { hours, minutes } as never),
    durationHours: (hours) => t("duration.hours" as never, { hours } as never),
    durationMinutesSeconds: (minutes, seconds) =>
      t("duration.minutesSeconds" as never, { minutes, seconds } as never),
    durationMinutes: (minutes) => t("duration.minutes" as never, { minutes } as never),
    durationSeconds: (seconds) => t("duration.seconds" as never, { seconds } as never),
    durationMinutesShort: (minutes) => t("duration.minutesShort" as never, { minutes } as never),
  };
}

function getDefaultDisplayMessages(): DisplayMessages {
  return createDisplayMessages(createCommonTranslator(messages.common) as AnyTranslator);
}

export { getDefaultDisplayMessages };
