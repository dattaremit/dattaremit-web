"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  back?: { href: string; label: string };
  className?: string;
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  back,
  className,
}: AuthShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT_SMOOTH }}
      className={cn("flex w-full flex-col gap-7", className)}
    >
      <header className="flex flex-col gap-3">
        {back && (
          <Link
            href={back.href}
            className="self-start text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {back.label}
          </Link>
        )}
        {eyebrow && (
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground">
            <span className="size-1.5 rounded-full bg-brand" />
            {eyebrow}
          </span>
        )}
        <h1 className="font-semibold text-4xl leading-[1.05] text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
      </header>

      <div>{children}</div>

      {footer && <footer className="text-sm text-muted-foreground">{footer}</footer>}
    </motion.div>
  );
}
