type FormMessageProps = {
  error?: string | null;
  success?: string | null;
};

export function FormMessage({ error, success }: FormMessageProps) {
  if (error) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-[#2a1717] px-3 py-2 text-sm text-red-300">
        {error}
      </p>
    );
  }

  if (!success) {
    return null;
  }

  return (
    <p className="rounded-xl border border-emerald-500/30 bg-[#14241a] px-3 py-2 text-sm text-emerald-300">
      {success}
    </p>
  );
}
