import { Suspense } from "react";

import { InvitesList, InvitesListSkeleton } from "@/components/invites/invites-list";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";

export default async function InvitesPage() {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 lg:max-w-3xl lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{messages.invites.title}</h1>
      <p className="mt-2 text-sm text-zinc-400">{messages.invites.pageHint}</p>
      <div className="mt-6">
        <Suspense fallback={<InvitesListSkeleton />}>
          <InvitesList />
        </Suspense>
      </div>
    </div>
  );
}
