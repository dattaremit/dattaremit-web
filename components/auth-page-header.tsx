interface AuthPageHeaderProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
}

export function AuthPageHeader({ title, subtitle, eyebrow }: AuthPageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-3">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground">
          <span className="size-1.5 rounded-full bg-brand" />
          {eyebrow}
        </span>
      )}
      <h1 className="font-semibold text-4xl leading-[1.05] text-foreground sm:text-5xl">{title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>
    </div>
  );
}
