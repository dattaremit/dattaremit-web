import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const envelope = await request.text();

  // Use the server-side DSN — never trust the DSN embedded in the envelope body.
  const envDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!envDsn) {
    return new NextResponse("Sentry DSN not configured", { status: 500 });
  }

  const dsn = new URL(envDsn);
  const projectId = dsn.pathname.replace("/", "");
  const sentryUrl = `https://${dsn.hostname}/api/${projectId}/envelope/`;

  const sentryResponse = await fetch(sentryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body: envelope,
  });

  return new NextResponse(null, { status: sentryResponse.status });
}
