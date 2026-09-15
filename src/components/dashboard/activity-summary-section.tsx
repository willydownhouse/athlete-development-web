type ActivitySummarySectionProps = {
  children: React.ReactNode;
};

export function ActivitySummarySection({ children }: ActivitySummarySectionProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <h2 className="text-sm font-semibold text-white sm:text-base">Activity</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
