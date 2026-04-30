import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ROUTES } from "@/constants/routes";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AuroraBackground variant="marketing" />

      <header className="relative z-20 flex h-16 items-center justify-between px-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Dattapay" width={28} height={24} />
          <span className="font-semibold text-xl text-foreground">Dattapay</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.SIGN_IN}>Sign in</Link>
          </Button>
          <Button asChild variant="brand" size="sm">
            <Link href={ROUTES.SIGN_UP}>Get started</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-10 sm:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
