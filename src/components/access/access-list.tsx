import { AccessMemberCard } from "@/components/access/access-member-card";
import { PendingInviteCard } from "@/components/access/pending-invite-card";
import { Skeleton } from "@/components/ui/skeleton";
import { loadAthleteAccess } from "@/lib/load-athlete-access";

export function AccessListSkeleton() {
  return (
    <div className="space-y-4">
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-4 w-48" />
      </section>
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-4 w-56" />
      </section>
    </div>
  );
}

export async function AccessList({ athleteId }: { athleteId: string }) {
  const result = await loadAthleteAccess(athleteId);

  if (result.error) {
    return (
      <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
        <p className="text-sm text-red-300">{result.error}</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">People with access</h2>
        {result.members.map((member) => (
          <AccessMemberCard
            key={member.id}
            athleteId={athleteId}
            member={member}
            isCurrentUser={member.user.id === result.currentUserId}
          />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Pending invitations</h2>
        {result.invitations.length === 0 ? (
          <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4 sm:px-5">
            <p className="text-sm text-zinc-400">No pending invitations.</p>
          </section>
        ) : (
          result.invitations.map((invitation) => (
            <PendingInviteCard key={invitation.id} athleteId={athleteId} invitation={invitation} />
          ))
        )}
      </section>
    </div>
  );
}
