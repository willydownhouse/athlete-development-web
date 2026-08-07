import { InfoTooltip } from "@/components/ui/info-tooltip";

const RPE_SCALE_ROWS = [
  { rpe: "1–2", feeling: "Very easy", example: "Recovery / walking" },
  { rpe: "3–4", feeling: "Easy", example: "Comfortable aerobic exercise" },
  { rpe: "5–6", feeling: "Moderate", example: "Noticeably working, sustainable" },
  { rpe: "7", feeling: "Hard", example: "Challenging but controlled" },
  { rpe: "8", feeling: "Very hard", example: "Only a few more reps/minutes possible" },
  { rpe: "9", feeling: "Near maximal", example: "Almost all-out" },
  { rpe: "10", feeling: "Maximal", example: "Absolute maximum effort" },
] as const;

function RpeScaleGuideTable() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-white">RPE scale guide</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[18rem] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400">
              <th className="pb-2 pr-3 font-medium">RPE</th>
              <th className="pb-2 pr-3 font-medium">Feeling</th>
              <th className="pb-2 font-medium">Example</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {RPE_SCALE_ROWS.map((row) => (
              <tr key={row.rpe} className="border-b border-white/5 last:border-b-0">
                <td className="py-2 pr-3 align-top font-medium text-white">{row.rpe}</td>
                <td className="py-2 pr-3 align-top">{row.feeling}</td>
                <td className="py-2 align-top text-zinc-400">{row.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RpeScaleInfoTooltip() {
  return (
    <InfoTooltip label="Show RPE scale guide">
      <RpeScaleGuideTable />
    </InfoTooltip>
  );
}
