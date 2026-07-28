type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
      {description ? <p className="text-sm text-zinc-400">{description}</p> : null}
    </div>
  );
}
