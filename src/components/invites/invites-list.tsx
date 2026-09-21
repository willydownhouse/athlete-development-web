import { InviteCard } from "@/components/invites/invite-card";
import { Skeleton } from "@/components/ui/skeleton";
import { loadInvitationInbox } from "@/lib/load-invitation-inbox";

export function InvitesListSkeleton() {
  return (
    <div className="space-y-4">
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-4 w-56" />
        <Skeleton className="mt-4 h-10 w-28" />
      </section>
    </div>
  );
}

export async function InvitesList() {
  const result = await loadInvitationInbox();

  if (result.error) {
    return (
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
        <p className="text-sm text-red-300">{result.error}</p>
      </section>
    );
  }

  if (result.invitations.length === 0) {
    return (
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
        <p className="text-sm text-zinc-400">You have no pending invitations.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {result.invitations.map((invitation) => (
        <InviteCard key={invitation.id} invitation={invitation} />
      ))}
    </div>
  );
}
