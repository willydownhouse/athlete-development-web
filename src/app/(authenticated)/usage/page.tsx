import { Suspense } from "react";

import { UsageMeters, UsageMetersSkeleton } from "@/components/usage/usage-meters";
import { UsagePlanCard } from "@/components/usage/usage-plan-card";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";

export default async function UsagePage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{messages.usage.title}</h1>
      <div className="mt-6 space-y-4">
        <UsagePlanCard />
        <Suspense fallback={<UsageMetersSkeleton />}>
          <UsageMeters />
        </Suspense>
      </div>
    </div>
  );
}
