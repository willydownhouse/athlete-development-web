export function navLinkClass(active: boolean): string {
  return `block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    active ? "bg-white/5 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
  }`;
}
