type StatusBadgeProps = {
  active: boolean;
};

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-zinc-400"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
