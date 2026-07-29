import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateOnboardingQuestionForm } from "@/components/admin/update-onboarding-question-form";
import { getAdminOnboardingQuestion, listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";
import { formatAnswerTypeLabel } from "@/lib/types";

type AdminOnboardingQuestionDetailPageProps = {
  params: Promise<{ onboardingQuestionId: string }>;
};

export default async function AdminOnboardingQuestionDetailPage({
  params,
}: AdminOnboardingQuestionDetailPageProps) {
  const { onboardingQuestionId } = await params;
  const { token } = await requireAdmin();

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
          ← Back to onboarding questions
        </Link>
        <PageHeader
          title={question.prompt}
          description={`Edit onboarding question ${question.key}.`}
        />
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <StatusBadge active={question.active} />
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300 capitalize">
            {formatAnswerTypeLabel(question.answerType)}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300">
            {question.sport?.name ?? "Common"}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-zinc-300">
            {question.required ? "Required" : "Optional"}
          </span>
        </div>
      </div>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <h2 className="text-lg font-medium text-white">Question settings</h2>
        <div className="mt-4">
          <UpdateOnboardingQuestionForm question={question} sports={sports} />
        </div>
      </section>
    </div>
  );
}
