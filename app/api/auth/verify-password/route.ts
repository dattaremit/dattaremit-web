import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Step-up verification endpoint. Accepts `{ password }`, verifies it against
 * the signed-in user's Clerk credentials, and returns `{ verified: true }`
 * on success. Used by the client step-up dialog before sensitive actions
 * (money transfers).
 *
 * Clerk's client SDK doesn't expose password verification, so we bounce
 * through this route to the backend `users.verifyPassword` API. Runs inside
 * the Next.js app — no changes needed to the Express server.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json(
      { verified: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { verified: false, message: "Password is required" },
      { status: 400 },
    );
  }

  try {
    const client = await clerkClient();
    await client.users.verifyPassword({ userId, password });
    return NextResponse.json({ verified: true });
  } catch {
    // Clerk returns a 422 when the password is wrong — surface as verified:false
    return NextResponse.json(
      { verified: false, message: "Incorrect password" },
      { status: 401 },
    );
  }
}
