import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import { formatAnswerTypeLabel, type OnboardingQuestion } from "@/lib/types";

type OnboardingQuestionListProps = {
  questions: OnboardingQuestion[];
};

export function OnboardingQuestionList({ questions }: OnboardingQuestionListProps) {
  return (
    <>
      <ul className="divide-y divide-white/10 md:hidden">
        {questions.map((question) => (
          <li key={question.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{question.prompt}</h3>
                  <StatusBadge active={question.active} />
                </div>
                <p className="mt-1 break-all font-mono text-sm text-zinc-500">{question.key}</p>
              </div>
              <Link
                href={`/admin/onboarding-questions/${question.id}`}
                className="shrink-0 text-sm font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
              >
                Edit
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">Type</dt>
                <dd className="capitalize text-zinc-300">
                  {formatAnswerTypeLabel(question.answerType)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Sport</dt>
                <dd className="text-zinc-300">{question.sport?.name ?? "Common"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Sort</dt>
                <dd className="text-zinc-300">{question.sortOrder}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Required</dt>
                <dd className="text-zinc-300">{question.required ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#12161d] text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-medium">Prompt</th>
              <th className="px-6 py-3 font-medium">Key</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Sport</th>
              <th className="px-6 py-3 font-medium">Sort</th>
              <th className="px-6 py-3 font-medium">Required</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {questions.map((question) => (
              <tr key={question.id} className="hover:bg-white/5">
                <td className="max-w-xs px-6 py-4 font-medium text-white">
                  <span className="line-clamp-2">{question.prompt}</span>
                </td>
                <td className="px-6 py-4 font-mono text-zinc-400">{question.key}</td>
                <td className="px-6 py-4 capitalize text-zinc-400">
                  {formatAnswerTypeLabel(question.answerType)}
                </td>
                <td className="px-6 py-4 text-zinc-400">{question.sport?.name ?? "Common"}</td>
                <td className="px-6 py-4 text-zinc-400">{question.sortOrder}</td>
                <td className="px-6 py-4 text-zinc-400">{question.required ? "Yes" : "No"}</td>
                <td className="px-6 py-4">
                  <StatusBadge active={question.active} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/onboarding-questions/${question.id}`}
                    className="font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
