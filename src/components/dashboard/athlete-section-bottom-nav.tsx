import type { Athlete } from "@/lib/types";

import { DashboardBottomNav } from "./dashboard-bottom-nav";
import { athleteSectionNavHrefs, type AthleteSectionNavPage } from "./dashboard-nav";

type AthleteSectionBottomNavProps = {
  athlete: Athlete;
  current: AthleteSectionNavPage;
};

export function AthleteSectionBottomNav({ athlete, current }: AthleteSectionBottomNavProps) {
  return <DashboardBottomNav {...athleteSectionNavHrefs(athlete, current)} />;
}
