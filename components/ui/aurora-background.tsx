import { cn } from "@/lib/utils";

type Variant = "auth" | "marketing" | "dashboard";

type AuroraBackgroundProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  auth: "opacity-80",
  marketing: "opacity-100",
  dashboard: "opacity-50",
};

export function AuroraBackground({ variant = "auth", className, ...props }: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        variants[variant],
        className,
      )}
      {...props}
    >
      <div
        className="absolute -top-1/3 -left-1/4 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(from var(--brand) l c h / 0.28), transparent 60%)",
          animation: "aurora-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[80vh] w-[80vh] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(from var(--brand-soft) l c h / 0.45), transparent 60%)",
          animation: "aurora-drift-slow 28s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/4 right-1/3 h-[50vh] w-[50vh] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, oklch(from var(--success) l c h / 0.18), transparent 65%)",
          animation: "aurora-drift 32s ease-in-out infinite reverse",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
