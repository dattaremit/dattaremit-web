import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { HeroPanel } from "@/components/ui/hero-panel";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — form panel */}
      <div className="relative flex w-full flex-col items-center justify-center px-5 py-12 sm:px-10 lg:w-2/3 lg:py-16">
        <AuroraBackground variant="auth" />
        <main className="relative z-10 w-full max-w-xl">
          <div className="rounded-2xl border border-border/40 bg-card/70 p-8 shadow-lift backdrop-blur-md sm:p-12">
            {children}
          </div>
        </main>
      </div>

      <HeroPanel />
    </div>
  );
}
