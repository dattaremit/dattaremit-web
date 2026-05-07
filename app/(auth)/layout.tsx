import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AuroraBackground } from "@/components/ui/aurora-background";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AuroraBackground variant="auth" />

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
