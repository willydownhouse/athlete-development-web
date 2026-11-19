import Link from "next/link";

import { athleteEventHref } from "@/components/dashboard/dashboard-nav";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";
import type { AthleteGoal, AthleteGoalType } from "@/lib/types";

const GOAL_ACCENT: Record<AthleteGoalType, string> = {
  near: "bg-[#b7d7ec]",
  season: "bg-[#7eafd4]",
  long_term: "bg-[#4d7394]",
};

type ProfileGoalsSectionProps = {
  athleteId: string;
  goals: AthleteGoal[];
};

export async function ProfileGoalsSection({ athleteId, goals }: ProfileGoalsSectionProps) {
  if (goals.length === 0) {
    return null;
  }

  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <section className="mt-6 rounded-2xl bg-[#171b22] px-4 py-5 sm:px-5">
      <h2 className="text-base font-semibold text-white">{messages.profile.goals}</h2>
      <ul className="mt-4 space-y-3">
        {goals.map((goal) => (
          <li key={goal.id}>
            <Link
              href={athleteEventHref(athleteId, goal.id)}
              className="group flex items-start gap-3 rounded-xl bg-[#1c222c] px-3 py-3 text-sm transition hover:bg-[#222833] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ec9e8]/40 lg:text-base"
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 h-9 w-1 shrink-0 rounded-full ${GOAL_ACCENT[goal.goalType]}`}
              />
              <span className="min-w-0 flex-1">
                <span className="text-xs font-medium text-zinc-400">
                  {messages.profile.goalTypes[goal.goalType]}
                </span>
                {goal.title ? (
                  <span className="mt-1 block font-medium text-white">{goal.title}</span>
                ) : null}
                {goal.description ? (
                  <span
                    className={`block whitespace-pre-wrap ${
                      goal.title ? "mt-1 text-zinc-300" : "mt-1 font-medium text-white"
                    }`}
                  >
                    {goal.description}
                  </span>
                ) : null}
              </span>
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="mt-1 size-4 shrink-0 text-zinc-500 transition group-hover:text-zinc-300"
              >
                <path d="M7.5 5 12.5 10 7.5 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
