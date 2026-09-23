const inputClassName =
  "w-full rounded-xl border border-white/10 bg-[#1c222c] px-3 py-2 text-sm text-white focus:border-[#9ec9e8] focus:outline-none focus:ring-2 focus:ring-[#9ec9e8]/20";

type FinnishNameFieldProps = {
  defaultValue?: string;
  placeholder?: string;
};

export function FinnishNameField({ defaultValue, placeholder }: FinnishNameFieldProps) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-zinc-300">Finnish name</span>
      <input
        name="nameFi"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClassName}
      />
    </label>
  );
}

type FinnishDescriptionFieldProps = {
  defaultValue?: string;
};

export function FinnishDescriptionField({ defaultValue }: FinnishDescriptionFieldProps) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-zinc-300">Finnish description</span>
      <textarea
        name="descriptionFi"
        rows={2}
        defaultValue={defaultValue}
        placeholder="Optional Finnish description for forms and AI tooling."
        className={inputClassName}
      />
    </label>
  );
}
