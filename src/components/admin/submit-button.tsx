"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "secondary";
  className?: string;
};

const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100",
};

export function SubmitButton({ children, variant = "primary", className = "" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed sm:w-auto sm:py-2 ${variantClasses[variant]} ${className}`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
