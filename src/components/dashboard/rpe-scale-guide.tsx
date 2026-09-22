"use client";

import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useAppLocale } from "@/lib/locale-context";
import { getMessages } from "@/lib/messages";

function RpeScaleGuideTable() {
  const messages = getMessages(useAppLocale());

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-white">{messages.events.rpeTitle}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[18rem] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400">
              <th className="pb-2 pr-3 font-medium">RPE</th>
              <th className="pb-2 pr-3 font-medium">{messages.events.rpeFeeling}</th>
              <th className="pb-2 font-medium">{messages.events.rpeExample}</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {messages.events.rpeRows.map((row) => (
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
  const messages = getMessages(useAppLocale());

  return (
    <InfoTooltip label={messages.events.rpeShow}>
      <RpeScaleGuideTable />
    </InfoTooltip>
  );
}
