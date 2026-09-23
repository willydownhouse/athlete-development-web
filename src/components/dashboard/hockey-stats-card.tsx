import type { HockeyStatTile } from "@/lib/hockey-stats/build-hockey-stat-tiles";
import { getRequestLocale } from "@/lib/locale-server";
import { getMessages } from "@/lib/messages";

type HockeyStatsCardProps = {
  tiles: HockeyStatTile[];
  loadError?: string | null;
};

export async function HockeyStatsCard({ tiles, loadError }: HockeyStatsCardProps) {
  const messages = getMessages(await getRequestLocale());

  if (loadError) {
    return <p className="text-sm text-red-300">{loadError}</p>;
  }

  if (tiles.length === 0) {
    return <p className="text-sm text-zinc-400">{messages.stats.empty}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => (
        <div key={tile.key} className="rounded-xl bg-white/5 px-3 py-3">
          <p className="text-2xl font-semibold tracking-tight text-white">
            {tile.value}
            {tile.eventCount !== undefined ? (
              <span className="text-base font-normal text-zinc-500">
                {" / "}
                {tile.eventCount} {messages.stats.eventCount(tile.eventCount)}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{tile.label}</p>
          {tile.subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{tile.subtitle}</p> : null}
        </div>
      ))}
    </div>
  );
}
