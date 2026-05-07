import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";

import { AuroraBackground } from "@/components/ui/aurora-background";

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

      {/* Right — hero image panel */}
      <div
        className="sticky top-0 hidden h-screen overflow-hidden lg:block lg:w-1/3"
        style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)" }}
      >
        <Image
          src="/auth.png"
          alt="Send money instantly with DattaRemit"
          fill
          className="object-contain object-bottom"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pb-10 pt-16">
          <p className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Send money home,
            <br />
            <span className="text-brand-soft">instantly.</span>
          </p>
          <p className="mt-3 text-base font-medium italic leading-relaxed text-white/80">
            Fast, secure and trusted international transfers, <br />
            right from your phone.
          </p>
        </div>
      </div>
    </div>
  );
}
