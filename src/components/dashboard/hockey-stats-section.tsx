type HockeyStatsSectionProps = {
  sportName: string;
  children: React.ReactNode;
};

export function HockeyStatsSection({ sportName, children }: HockeyStatsSectionProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <h2 className="min-w-0 truncate text-sm font-semibold text-white sm:text-base">
        {sportName} stats
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
