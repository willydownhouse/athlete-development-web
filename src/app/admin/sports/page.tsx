import { getTranslations } from "next-intl/server";

import { AdminCreateModal } from "@/components/admin/admin-create-modal";
import { CreateSportForm } from "@/components/admin/create-sport-form";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { UpdateSportForm } from "@/components/admin/update-sport-form";
import { listAdminSports } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminSportsPage() {
  const { token } = await requireAdmin();
  const t = await getTranslations("admin");
  const sports = await listAdminSports(token);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={t("sports.title")} description={t("sports.description")} />
        <AdminCreateModal title={t("sports.createSport")} buttonLabel={t("sports.createSport")}>
          <CreateSportForm />
        </AdminCreateModal>
      </div>

      <section className="rounded-[1.35rem] border border-white/10 bg-[#171b22]">
        <div className="border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-white">
            {t("sports.allSports", { count: sports.length })}
          </h2>
        </div>

        {sports.length === 0 ? (
          <p className="px-4 py-8 text-sm text-zinc-400 sm:px-6">{t("sports.empty")}</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {sports.map((sport) => (
              <li key={sport.id} className="px-4 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{sport.name}</h3>
                      <StatusBadge active={sport.active} />
                    </div>
                    <p className="mt-1 font-mono text-sm text-zinc-500">{sport.slug}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <UpdateSportForm sport={sport} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
