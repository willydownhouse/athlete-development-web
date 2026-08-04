export const dayPickerClassNames = {
  root: "p-1",
  months: "relative flex flex-col",
  month: "space-y-3",
  month_caption: "relative flex items-center justify-center px-10",
  caption_label: "text-sm font-semibold text-white",
  dropdowns: "flex items-center gap-2",
  dropdown_root: "relative",
  dropdown:
    "appearance-none rounded-lg border border-white/10 bg-[#252b36] py-1.5 pl-3 pr-8 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20",
  chevron: "pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-zinc-300 transition hover:bg-[#2f3642] hover:text-white disabled:cursor-not-allowed disabled:opacity-40",
  button_next:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#252b36] text-zinc-300 transition hover:bg-[#2f3642] hover:text-white disabled:cursor-not-allowed disabled:opacity-40",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 flex-1 text-center text-xs font-medium text-zinc-500",
  week: "mt-1 flex w-full",
  day: "relative flex-1 p-0 text-center text-sm",
  day_button:
    "mx-auto inline-flex h-9 w-9 items-center justify-center rounded-lg font-normal text-zinc-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ec9e8]/40 disabled:pointer-events-none disabled:opacity-40",
  selected:
    "[&>button]:bg-[#9ec9e8] [&>button]:font-medium [&>button]:text-[#111827] [&>button]:hover:bg-[#b7d7ec]",
  today: "[&>button]:border [&>button]:border-[#9ec9e8]/45",
  outside: "[&>button]:text-zinc-600 [&>button]:opacity-50",
  disabled: "[&>button]:cursor-not-allowed [&>button]:text-zinc-600 [&>button]:opacity-30",
  hidden: "invisible",
};
