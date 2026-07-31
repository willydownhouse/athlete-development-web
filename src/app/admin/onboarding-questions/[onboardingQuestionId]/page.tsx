import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateOnboardingQuestionForm } from "@/components/admin/update-onboarding-question-form";
import { getAdminOnboardingQuestion, listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";
import { createAnswerTypeLabel } from "@/lib/i18n-labels";

type AdminOnboardingQuestionDetailPageProps = {
  params: Promise<{ onboardingQuestionId: string }>;
};

export default async function AdminOnboardingQuestionDetailPage({
  params,
}: AdminOnboardingQuestionDetailPageProps) {
  const { onboardingQuestionId } = await params;
  const { token } = await requireAdmin();
  const tAdmin = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const answerTypeLabel = createAnswerTypeLabel(tAdmin);

  let question;

  try {
    question = await getAdminOnboardingQuestion(token, onboardingQuestionId);
  } catch {
    notFound();
  }

  const sports = await listAdminSports(token);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/onboarding-questions"
          className="inline-flex text-sm font-medium text-zinc-400 hover:text-white"
        >
          {tAdmin("onboardingQuestions.backToList")}
        </Link>
        <PageHeader
          title={question.prompt}
          description={tAdmin("onboardingQuestions.detailDescription", { key: question.key })}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <StatusBadge active={question.active} />
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300 capitalize">
            {answerTypeLabel(question.answerType)}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300">
            {question.sport?.name ?? tCommon("common")}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300">
            {question.required ? tCommon("required") : tCommon("optional")}
          </span>
        </div>
      </div>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <h2 className="text-lg font-medium text-white">
          {tAdmin("onboardingQuestions.settingsTitle")}
        </h2>
        <div className="mt-4">
          <UpdateOnboardingQuestionForm question={question} sports={sports} />
        </div>
      </section>
    </div>
  );
}
