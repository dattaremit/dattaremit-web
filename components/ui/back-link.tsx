import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export function BackLink({ href, label = "Back", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 self-start text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </Link>
  );
}
