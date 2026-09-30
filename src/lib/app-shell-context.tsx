"use client";

import { createContext, useContext } from "react";

import type { Athlete } from "@/lib/types";

const AppShellAthletesContext = createContext<Athlete[]>([]);

export function AppShellAthletesProvider({
  athletes,
  children,
}: {
  athletes: Athlete[];
  children: React.ReactNode;
}) {
  return (
    <AppShellAthletesContext.Provider value={athletes}>{children}</AppShellAthletesContext.Provider>
  );
}

export function useAppShellAthletes(): Athlete[] {
  return useContext(AppShellAthletesContext);
}
