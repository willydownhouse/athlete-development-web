export function EventMediaPlayBadge({ className }: { className: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-black/50 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[55%] w-[55%] translate-x-[1px]">
        <path fill="currentColor" d="M8 5.14v13.72L19.5 12 8 5.14z" />
      </svg>
    </span>
  );
}
