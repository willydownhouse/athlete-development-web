import { AdminCreateModal } from "@/components/admin/admin-create-modal";
import { CreateOnboardingQuestionForm } from "@/components/admin/create-onboarding-question-form";
import { OnboardingQuestionFilters } from "@/components/admin/onboarding-question-filters";
import { OnboardingQuestionList } from "@/components/admin/onboarding-question-list";
import { PageHeader } from "@/components/admin/page-header";
import { listAdminOnboardingQuestions, listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

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

  const sortedQuestions = [...questions].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.key.localeCompare(b.key),
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Onboarding questions"
          description="Configure common and sport-specific questions used in guided athlete onboarding."
        />
        <AdminCreateModal title="Create onboarding question" buttonLabel="Create question">
          <CreateOnboardingQuestionForm sports={sports} />
        </AdminCreateModal>
      </div>

      <OnboardingQuestionFilters sports={sports} />

      <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#171b22]">
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
          <OnboardingQuestionList questions={sortedQuestions} />
        )}
      </section>
    </div>
  );
}
