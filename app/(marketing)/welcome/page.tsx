import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WelcomeContent } from "@/components/welcome-content";

export default async function WelcomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return <WelcomeContent />;
}
