"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const navItems = [
  { href: "/admin", key: "overview" as const, exact: true },
  { href: "/admin/sports", key: "sports" as const },
  { href: "/admin/event-types", key: "eventTypes" as const },
  { href: "/admin/metric-definitions", key: "metricDefinitions" as const },
  { href: "/admin/onboarding-questions", key: "onboardingQuestions" as const },
];

type AdminNavProps = {
  onNavigate?: () => void;
};

export function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive ? "bg-white/5 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t(`nav.${item.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
