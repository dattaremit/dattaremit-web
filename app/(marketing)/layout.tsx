import Image from "next/image";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center px-6 border-b bg-background">
        <Image src="/logo.png" alt="Logo" width={36} height={30} />
      </header>
      <div className="relative flex flex-1 items-center justify-center px-4 overflow-hidden">
        {/* Animated background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl dark:bg-primary/20"
          style={{ animation: "blob-float 12s ease-in-out infinite" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-400/15"
          style={{ animation: "blob-float 16s ease-in-out infinite reverse" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/15"
          style={{ animation: "blob-float 14s ease-in-out infinite 2s" }}
        />

        <div className="relative z-10 w-full max-w-2xl py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
