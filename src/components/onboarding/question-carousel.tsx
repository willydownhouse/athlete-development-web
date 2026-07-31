"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { completeOnboardingAction, saveOnboardingAnswerAction } from "@/app/onboarding/actions";
import { FormMessage } from "@/components/admin/form-message";
import type { OnboardingQuestion } from "@/lib/types";

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2.5 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20 lg:py-3 lg:text-base";

type QuestionCarouselProps = {
  athleteId: string;
  sessionId: string;
  questions: OnboardingQuestion[];
  initialAnswers: Record<string, { rawAnswer: string; structuredValue?: unknown }>;
};

function sortQuestions(questions: OnboardingQuestion[]): OnboardingQuestion[] {
  return [...questions].sort((a, b) => a.sortOrder - b.sortOrder || a.key.localeCompare(b.key));
}

function isQuestionAnswered(
  questionId: string,
  answers: Record<string, { rawAnswer: string; structuredValue?: unknown }>,
): boolean {
  const answer = answers[questionId];
  return answer !== undefined && answer.rawAnswer.trim() !== "";
}

function findResumeQuestionIndex(
  sortedQuestions: OnboardingQuestion[],
  answers: Record<string, { rawAnswer: string; structuredValue?: unknown }>,
): number {
  if (sortedQuestions.length === 0) {
    return 0;
  }

  const firstUnanswered = sortedQuestions.findIndex(
    (question) => !isQuestionAnswered(question.id, answers),
  );

  return firstUnanswered === -1 ? sortedQuestions.length - 1 : firstUnanswered;
}

function optionsAsStrings(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.filter((item): item is string => typeof item === "string");
}

export function QuestionCarousel({
  athleteId,
  sessionId,
  questions,
  initialAnswers,
}: QuestionCarouselProps) {
  const t = useTranslations("onboarding.questions");
  const tCommon = useTranslations("common");
  const sortedQuestions = useMemo(() => sortQuestions(questions), [questions]);

  const [index, setIndex] = useState(() =>
    findResumeQuestionIndex(sortQuestions(questions), initialAnswers),
  );
  const [answers, setAnswers] = useState(initialAnswers);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const question = sortedQuestions[index];
  const total = sortedQuestions.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const current = question ? (answers[question.id] ?? { rawAnswer: "" }) : { rawAnswer: "" };

  function updateAnswer(rawAnswer: string, structuredValue?: unknown) {
    if (!question) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [question.id]: { rawAnswer, structuredValue },
    }));
  }

  function handleContinue() {
    if (!question) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await saveOnboardingAnswerAction({
        athleteId,
        sessionId,
        questionId: question.id,
        rawAnswer: current.rawAnswer,
        structuredValue: current.structuredValue,
        required: question.required,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (isLast) {
        const completeResult = await completeOnboardingAction({ athleteId, sessionId });
        if (completeResult.error) {
          setError(completeResult.error);
        }
        return;
      }

      setIndex((value) => value + 1);
    });
  }

  if (!question) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">{t("noneConfigured")}</p>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await completeOnboardingAction({ athleteId, sessionId });
              if (result.error) {
                setError(result.error);
              }
            });
          }}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] disabled:opacity-50 sm:w-auto"
        >
          {t("continueToDashboard")}
        </button>
        <FormMessage error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="flex items-center justify-between gap-3 text-sm text-zinc-500">
        <p>{tCommon("countOfTotal", { current: index + 1, total })}</p>
        <p>{question.required ? tCommon("required") : tCommon("optional")}</p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
            {question.prompt}
          </h2>
          {question.helpText ? (
            <p className="text-[15px] leading-relaxed text-zinc-400 lg:text-base">
              {question.helpText}
            </p>
          ) : null}
        </div>

        <QuestionInput question={question} rawAnswer={current.rawAnswer} onChange={updateAnswer} />
      </div>

      <FormMessage error={error} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isFirst || pending}
          onClick={() => {
            setError(null);
            setIndex((value) => Math.max(0, value - 1));
          }}
          className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#1c222c] px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-[#252b36] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto lg:text-base"
        >
          {tCommon("back")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={handleContinue}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#b7d7ec] px-4 py-3 text-sm font-medium text-[#1a2430] transition hover:bg-[#c5dff0] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto lg:text-base"
        >
          {pending ? tCommon("saving") : isLast ? tCommon("finish") : tCommon("continue")}
        </button>
      </div>
    </div>
  );
}

type QuestionInputProps = {
  question: OnboardingQuestion;
  rawAnswer: string;
  onChange: (rawAnswer: string, structuredValue?: unknown) => void;
};

function QuestionInput({ question, rawAnswer, onChange }: QuestionInputProps) {
  const t = useTranslations("onboarding.questions");
  const tCommon = useTranslations("common");
  const options = optionsAsStrings(question.options);

  switch (question.answerType) {
    case "boolean":
      return (
        <div className="flex gap-3">
          {[
            { label: tCommon("yes"), value: "true", structured: true },
            { label: tCommon("no"), value: "false", structured: false },
          ].map((option) => {
            const selected = rawAnswer === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value, option.structured)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  selected
                    ? "border-[#9ec9e8]/45 bg-[#1c222c] text-white"
                    : "border-white/10 bg-[#1c222c]/60 text-zinc-300 hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );

    case "number":
      return (
        <input
          type="number"
          value={rawAnswer}
          onChange={(event) => {
            const value = event.target.value;
            const parsed = Number(value);
            onChange(value, value === "" || Number.isNaN(parsed) ? undefined : parsed);
          }}
          className={inputClassName}
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={rawAnswer}
          onChange={(event) => onChange(event.target.value, event.target.value || undefined)}
          className={inputClassName}
        />
      );

    case "single_select":
      return (
        <div className="space-y-2">
          {options.map((option) => {
            const selected = rawAnswer === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option, option)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-[#9ec9e8]/45 bg-[#1c222c] text-white"
                    : "border-white/10 bg-[#1c222c]/60 text-zinc-300 hover:border-white/20"
                }`}
              >
                <span>{option}</span>
                {selected ? <span className="text-[#9ec9e8]">{tCommon("selected")}</span> : null}
              </button>
            );
          })}
        </div>
      );

    case "multi_select": {
      const selectedValues = rawAnswer
        ? rawAnswer
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      return (
        <div className="space-y-2">
          {options.map((option) => {
            const selected = selectedValues.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  const next = selected
                    ? selectedValues.filter((item) => item !== option)
                    : [...selectedValues, option];
                  onChange(next.join("\n"), next);
                }}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-[#9ec9e8]/45 bg-[#1c222c] text-white"
                    : "border-white/10 bg-[#1c222c]/60 text-zinc-300 hover:border-white/20"
                }`}
              >
                <span>{option}</span>
                {selected ? <span className="text-[#9ec9e8]">{tCommon("selected")}</span> : null}
              </button>
            );
          })}
        </div>
      );
    }

    case "json":
      return (
        <textarea
          rows={5}
          value={rawAnswer}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("jsonPlaceholder")}
          className={`${inputClassName} font-mono`}
        />
      );

    case "text":
    default:
      return (
        <textarea
          rows={4}
          value={rawAnswer}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        />
      );
  }
}
