import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { AuroraBackground } from "@/components/ui/aurora-background";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AuroraBackground variant="auth" />

      <header className="relative z-20 flex h-16 items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Dattaremit" width={32} height={27} />
          <span className="font-semibold text-xl text-foreground">Dattaremit</span>
        </Link>
        <span className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground sm:block">
          Cross-border money, simply
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
