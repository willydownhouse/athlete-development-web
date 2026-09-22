import { AdminCreateModal } from "@/components/admin/admin-create-modal";
import { CreateDemoAllowedEmailForm } from "@/components/admin/create-demo-allowed-email-form";
import { DeleteDemoAllowedEmailForm } from "@/components/admin/delete-demo-allowed-email-form";
import { PageHeader } from "@/components/admin/page-header";
import { listAdminDemoAllowedEmails } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

const addedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatAddedAt(iso: string): string {
  return addedAtFormatter.format(new Date(iso));
}

export default async function AdminDemoUsersPage() {
  const { token } = await requireAdmin();
  const { enabled, items } = await listAdminDemoAllowedEmails(token);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Demo users"
          description="Google emails that may sign in and receive invitations when demo access is on."
        />
        <AdminCreateModal title="Add demo email" buttonLabel="Add email">
          <CreateDemoAllowedEmailForm />
        </AdminCreateModal>
      </div>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium text-white">Demo access</h2>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-zinc-400"
            }`}
          >
            {enabled ? "Gate on" : "Gate off"}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          {enabled
            ? "Only listed Google emails can use the API or be invited. Existing admins can still sign in to manage this list."
            : "Anyone with a Google account can sign in. Add emails here, then set DEMO_ACCESS_ENABLED=true on the API."}
        </p>
      </section>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-white">Allowed emails ({items.length})</h2>
        </div>

        {items.length === 0 ? (
          <p className="px-4 py-8 text-sm text-zinc-400 sm:px-6">No emails yet.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-white">{item.email}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Added {formatAddedAt(item.createdAt)}
                  </p>
                </div>
                <DeleteDemoAllowedEmailForm demoAllowedEmailId={item.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
