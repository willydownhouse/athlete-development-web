"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "secondary";
  className?: string;
  disabled?: boolean;
};

const variantClasses = {
  primary: "bg-[#b7d7ec] text-[#1a2430] hover:bg-[#c5dff0] disabled:opacity-50",
  danger: "bg-red-700 text-white hover:bg-red-600 disabled:opacity-50",
  secondary:
    "border border-white/10 bg-[#1c222c] text-zinc-200 hover:bg-[#252b36] disabled:opacity-50",
};

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed sm:w-auto sm:py-2 ${variantClasses[variant]} ${className}`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
