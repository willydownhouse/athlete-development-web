import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { QuestionCarousel } from "@/components/onboarding/question-carousel";
import {
  fetchAthletes,
  fetchCurrentAppUser,
  fetchOnboardingQuestions,
  getOnboardingSession,
} from "@/lib/api";
import { getAuthBearerToken } from "@/lib/auth-token";
import type { OnboardingQuestion } from "@/lib/types";

type OnboardingQuestionsPageProps = {
  searchParams: Promise<{
    athleteId?: string;
    sessionId?: string;
    sportId?: string;
  }>;
};

export default async function OnboardingQuestionsPage({
  searchParams,
}: OnboardingQuestionsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const params = await searchParams;
  const athleteId = params.athleteId?.trim() ?? "";
  const sessionId = params.sessionId?.trim() ?? "";
  const sportId = params.sportId?.trim() ?? "";

  if (!athleteId || !sessionId) {
    redirect("/onboarding");
  }

  const token = await getAuthBearerToken();

  if (!token) {
    redirect("/");
  }

  let isAdmin = false;

  const [athletesResult, appUserResult, onboardingSessionResult] = await Promise.allSettled([
    fetchAthletes(token),
    fetchCurrentAppUser(token),
    getOnboardingSession(token, athleteId, sessionId),
  ]);

  if (appUserResult.status === "fulfilled") {
    isAdmin = appUserResult.value.role === "admin";
  }

  if (onboardingSessionResult.status === "rejected") {
    redirect("/onboarding");
  }

  const onboardingSession = onboardingSessionResult.value;

  if (onboardingSession.status === "completed") {
    redirect("/dashboard");
  }

  if (athletesResult.status === "fulfilled") {
    const ownsAthlete = athletesResult.value.some((athlete) => athlete.id === athleteId);
    if (!ownsAthlete) {
      redirect("/onboarding");
    }
  }

  const focusSportId = sportId || onboardingSession.sportId;

  let questions: OnboardingQuestion[] = [];

  try {
    questions = await fetchOnboardingQuestions(token, focusSportId);
  } catch {
    redirect(`/onboarding/athlete?sportId=${encodeURIComponent(focusSportId)}`);
  }

  const initialAnswers: Record<string, { rawAnswer: string; structuredValue?: unknown }> = {};

  for (const answer of onboardingSession.answers ?? []) {
    initialAnswers[answer.questionId] = {
      rawAnswer: answer.rawAnswer,
      structuredValue: answer.structuredValue ?? undefined,
    };
  }

  return (
    <OnboardingShell userEmail={session.user.email ?? ""} isAdmin={isAdmin}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:max-w-3xl lg:px-10 lg:py-16">
        <div className="mb-5 lg:mb-7">
          <p className="text-sm text-zinc-400 lg:text-base">
            {onboardingSession.sport.name} onboarding
          </p>
        </div>

        <QuestionCarousel
          athleteId={athleteId}
          sessionId={sessionId}
          questions={questions}
          initialAnswers={initialAnswers}
        />
      </div>
    </OnboardingShell>
  );
}
