import type { HockeyStatTile } from "@/lib/hockey-stats/build-hockey-stat-tiles";

type HockeyStatsCardProps = {
  tiles: HockeyStatTile[];
  periodLabel?: string;
  loadError?: string | null;
};

export function HockeyStatsCard({ tiles, periodLabel, loadError }: HockeyStatsCardProps) {
  return (
    <section className="rounded-[1.35rem] bg-[#171b22] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Hockey stats</h2>
        {periodLabel ? <span className="text-sm text-zinc-400">{periodLabel}</span> : null}
      </div>

      {loadError ? (
        <p className="mt-4 text-sm text-red-300">{loadError}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {tiles.map((tile) => (
            <div key={tile.key} className="rounded-xl bg-white/5 px-3 py-3">
              <p className="text-2xl font-semibold tracking-tight text-white">{tile.value}</p>
              <p className="mt-1 text-sm text-zinc-400">{tile.label}</p>
              {tile.subtitle ? (
                <p className="mt-0.5 text-xs text-zinc-500">{tile.subtitle}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
