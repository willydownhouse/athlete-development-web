import { redirect } from "next/navigation";

import { fetchAthleteWeeklySummary } from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { AppLocale } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type {
  AthleteGoal,
  AthleteGoalType,
  WeeklyEffortLevel,
  WeeklyReportGoalStatus,
} from "@/lib/types";
import { inclusivePeriodEnd } from "@/lib/weekly-report";

const GOAL_ACCENT: Record<AthleteGoalType, string> = {
  near: "bg-[#b7d7ec]",
  season: "bg-[#7eafd4]",
  long_term: "bg-[#4d7394]",
};

const STATUS_CHIP: Record<WeeklyReportGoalStatus, string> = {
  forward: "bg-[#163028] text-[#8ee0b8]",
  held_back: "bg-[#2c2114] text-[#ffb35a]",
  untouched: "bg-white/5 text-zinc-400",
};

const EFFORT_CHIP: Record<WeeklyEffortLevel, string> = {
  easy: "bg-[#163028] text-[#8ee0b8]",
  moderate: "bg-[#2c2114] text-[#ffb35a]",
  hard: "bg-[#2c1618] text-[#ff8d7a]",
};

const SECTION_TONE = {
  highlights: "text-[#b7d7ec]",
  concerns: "text-[#ffc56e]",
  patterns: "text-zinc-300",
  nextFocus: "text-[#b7d7ec]",
  goals: "text-zinc-300",
  data: "text-zinc-500",
} as const;

function formatReportDate(value: string, locale: AppLocale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match?.[1] || !match[2] || !match[3]) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
}

function goalDetails(goals: AthleteGoal[], goalId: string) {
  const goal = goals.find((item) => item.id === goalId);
  if (!goal) {
    return { name: null, goalType: null };
  }

  return {
    name: goal.title ?? goal.description,
    goalType: goal.goalType,
  };
}

function ReportLines({
  title,
  lines,
  tone,
}: {
  title: string;
  lines: string[];
  tone: keyof typeof SECTION_TONE;
}) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <h3 className={`text-xs font-semibold ${SECTION_TONE[tone]}`}>{title}</h3>
      <ul className="mt-2 list-none space-y-1.5">
        {lines.map((line, index) => (
          <li key={`${index}-${line}`} className="text-sm leading-6 text-zinc-200">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

type ProfileWeeklyReportSectionProps = {
  athleteId: string;
  goals: AthleteGoal[];
};

export async function ProfileWeeklyReportSection({
  athleteId,
  goals,
}: ProfileWeeklyReportSectionProps) {
  const token = await getAuthBearerToken();
  if (!token) {
    redirect("/");
  }

  const [summary, locale] = await Promise.all([
    fetchAthleteWeeklySummary(token, athleteId),
    getRequestLocale(),
  ]);
  if (!summary) {
    return null;
  }

  const messages = getMessages(locale);
  const report = summary.report;
  const range = `${formatReportDate(summary.periodStart, locale)} – ${formatReportDate(inclusivePeriodEnd(summary.periodEnd), locale)}`;
  const hasDetails =
    report.highlights.length > 0 ||
    report.concerns.length > 0 ||
    report.patterns.length > 0 ||
    report.goalProgress.length > 0 ||
    report.nextFocus.length > 0 ||
    report.dataQuality.length > 0;
  const header = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#9ec9e8]">{messages.profile.weeklyReport}</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-white">{range}</p>
        </div>
        {hasDetails ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-1 size-4 shrink-0 text-[#9ec9e8] transition group-open:rotate-180"
          >
            <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
      <div className="mt-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${EFFORT_CHIP[report.effort.level]}`}
        >
          {messages.profile.effortLevel[report.effort.level]}
        </span>
        <p className="mt-2 text-sm leading-6 text-zinc-200">{report.effort.reason}</p>
      </div>
      {report.whatHappened ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-100">
          {report.whatHappened}
        </p>
      ) : null}
    </>
  );
  const headerClassName = "bg-gradient-to-b from-[#1e2530] to-[#171b22] px-4 py-5 sm:px-5";

  return (
    <section className="mt-6 overflow-hidden rounded-2xl bg-[#171b22]">
      {hasDetails ? (
        <details className="group">
          <summary
            className={`${headerClassName} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
          >
            {header}
          </summary>
          <div className="px-4 pb-1 sm:px-5">
            <ReportLines
              title={messages.profile.reportSections.highlights}
              lines={report.highlights}
              tone="highlights"
            />
            <ReportLines
              title={messages.profile.reportSections.concerns}
              lines={report.concerns}
              tone="concerns"
            />
            <ReportLines
              title={messages.profile.reportSections.patterns}
              lines={report.patterns}
              tone="patterns"
            />

            {report.goalProgress.length > 0 ? (
              <section className="py-4">
                <h3 className={`text-xs font-semibold ${SECTION_TONE.goals}`}>
                  {messages.profile.reportSections.goalProgress}
                </h3>
                <ul className="mt-3 list-none">
                  {report.goalProgress.map((item) => {
                    const goal = goalDetails(goals, item.goalId);
                    return (
                      <GoalProgress
                        key={item.goalId}
                        name={goal.name}
                        goalType={goal.goalType}
                        status={item.status}
                        statusLabel={messages.profile.goalStatus[item.status]}
                        evidence={item.evidence}
                      />
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {report.nextFocus.length > 0 ? (
              <section className="py-4">
                <h3 className={`text-xs font-semibold ${SECTION_TONE.nextFocus}`}>
                  {messages.profile.reportSections.nextFocus}
                </h3>
                <ul className="mt-2 list-none space-y-1.5">
                  {report.nextFocus.map((item, index) => (
                    <li key={`${item.goalId}-${index}`} className="text-sm leading-6 text-zinc-200">
                      {item.text}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {report.dataQuality ? (
              <section className="py-4">
                <h3 className={`text-xs font-semibold ${SECTION_TONE.data}`}>
                  {messages.profile.reportSections.dataQuality}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{report.dataQuality}</p>
              </section>
            ) : null}
          </div>
        </details>
      ) : (
        <div className={headerClassName}>{header}</div>
      )}
    </section>
  );
}

function GoalProgress({
  name,
  goalType,
  status,
  statusLabel,
  evidence,
}: {
  name: string | null;
  goalType: AthleteGoalType | null;
  status: WeeklyReportGoalStatus;
  statusLabel: string;
  evidence: string[];
}) {
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span
        aria-hidden="true"
        className={`my-1 w-1 shrink-0 rounded-full ${goalType ? GOAL_ACCENT[goalType] : "bg-zinc-600"}`}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          {name ? <span className="text-sm font-medium text-white">{name}</span> : null}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CHIP[status]}`}>
            {statusLabel}
          </span>
        </span>
        {evidence.length > 0 ? (
          <ul className="mt-2 list-none space-y-1">
            {evidence.map((line, index) => (
              <li key={`${index}-${line}`} className="text-sm leading-6 text-zinc-300">
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </span>
    </li>
  );
}
