import type { ReactNode } from "react";

type FormSectionDetailsProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function SectionChevron() {
  return (
    <svg
      aria-hidden="true"
      data-item-chevron
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="size-4 shrink-0 text-zinc-500 transition"
    >
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FormSectionDetails({ title, description, children }: FormSectionDetailsProps) {
  return (
    <details className="open:[&>summary_[data-item-chevron]]:rotate-180">
      <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <SectionChevron />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-white">{title}</span>
          {description ? (
            <span className="mt-1 block text-xs text-zinc-500">{description}</span>
          ) : null}
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
