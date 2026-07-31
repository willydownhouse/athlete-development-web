import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { StatusBadge } from "@/components/admin/status-badge";
import { createAnswerTypeLabel } from "@/lib/i18n-labels";
import type { OnboardingQuestion } from "@/lib/types";

type OnboardingQuestionListProps = {
  questions: OnboardingQuestion[];
};

export async function OnboardingQuestionList({ questions }: OnboardingQuestionListProps) {
  const tCommon = await getTranslations("common");
  const tAdmin = await getTranslations("admin");
  const answerTypeLabel = createAnswerTypeLabel(tAdmin);

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
                {tCommon("edit")}
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-zinc-500">{tCommon("type")}</dt>
                <dd className="capitalize text-zinc-300">{answerTypeLabel(question.answerType)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{tCommon("sport")}</dt>
                <dd className="text-zinc-300">{question.sport?.name ?? tCommon("common")}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{tCommon("sort")}</dt>
                <dd className="text-zinc-300">{question.sortOrder}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">{tCommon("required")}</dt>
                <dd className="text-zinc-300">
                  {question.required ? tCommon("yes") : tCommon("no")}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#12161d] text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-6 py-3 font-medium">{tCommon("prompt")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("key")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("type")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("sport")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("sort")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("required")}</th>
              <th className="px-6 py-3 font-medium">{tCommon("status")}</th>
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
                  {answerTypeLabel(question.answerType)}
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {question.sport?.name ?? tCommon("common")}
                </td>
                <td className="px-6 py-4 text-zinc-400">{question.sortOrder}</td>
                <td className="px-6 py-4 text-zinc-400">
                  {question.required ? tCommon("yes") : tCommon("no")}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge active={question.active} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/onboarding-questions/${question.id}`}
                    className="font-medium text-[#9ec9e8] hover:text-[#b7d7ec]"
                  >
                    {tCommon("edit")}
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
