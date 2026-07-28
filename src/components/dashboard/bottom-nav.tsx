const NAV_ITEMS = [
  { id: "today", label: "Today", active: true },
  { id: "calendar", label: "Calendar", active: false },
  { id: "chat", label: "Chat", active: false },
] as const;

export function DashboardBottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#0f1217]/90 backdrop-blur-md lg:left-64"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-around gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.active ? "page" : undefined}
            className={
              item.active
                ? "rounded-full bg-[#b7d7ec] px-5 py-2.5 text-sm font-semibold text-[#1a2430]"
                : "rounded-full px-5 py-2.5 text-sm font-medium text-zinc-400"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
