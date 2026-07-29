import { CreateOnboardingQuestionForm } from "@/components/admin/create-onboarding-question-form";
import { OnboardingQuestionFilters } from "@/components/admin/onboarding-question-filters";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateOnboardingQuestionForm } from "@/components/admin/update-onboarding-question-form";
import { listAdminOnboardingQuestions, listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";
import { formatAnswerTypeLabel } from "@/lib/types";

type AdminOnboardingQuestionsPageProps = {
  searchParams: Promise<{ sportId?: string; active?: string }>;
};

export default async function AdminOnboardingQuestionsPage({
  searchParams,
}: AdminOnboardingQuestionsPageProps) {
  const { token } = await requireAdmin();
  const params = await searchParams;

  const activeFilter =
    params.active === "true" ? true : params.active === "false" ? false : undefined;

  const [sports, questions] = await Promise.all([
    listAdminSports(token),
    listAdminOnboardingQuestions(token, {
      sportId: params.sportId,
      active: activeFilter,
    }),
  ]);

  const sortedQuestions = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Onboarding questions"
        description="Configure common and sport-specific questions used in guided athlete onboarding."
      />

      <OnboardingQuestionFilters sports={sports} />

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] p-4 sm:p-6">
        <h2 className="text-lg font-medium text-white">Create onboarding question</h2>
        <div className="mt-4">
          <CreateOnboardingQuestionForm sports={sports} />
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-white">
            Onboarding questions ({sortedQuestions.length})
          </h2>
        </div>

        {sortedQuestions.length === 0 ? (
          <p className="px-4 py-8 text-sm text-zinc-400 sm:px-6">
            No onboarding questions match the filters.
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {sortedQuestions.map((question) => (
              <li key={question.id} className="px-4 py-5 sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white">{question.prompt}</h3>
                    <StatusBadge active={question.active} />
                  </div>
                  <p className="mt-1 font-mono text-sm text-zinc-500">{question.key}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {formatAnswerTypeLabel(question.answerType)}
                    {" · "}
                    sort {question.sortOrder}
                    {" · "}
                    {question.required ? "required" : "optional"}
                    {" · "}
                    {question.sport?.name ?? "Common"}
                  </p>
                  {question.helpText ? (
                    <p className="mt-2 text-sm text-zinc-400">{question.helpText}</p>
                  ) : null}
                  {question.mapsToField ? (
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                      maps to {question.mapsToField}
                    </p>
                  ) : null}
                </div>
                <div className="mt-4">
                  <UpdateOnboardingQuestionForm question={question} sports={sports} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
