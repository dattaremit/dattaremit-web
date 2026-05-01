import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const envelope = await request.text();
  const pieces = envelope.split("\n");
  const header = JSON.parse(pieces[0] ?? "{}");
  const dsn = new URL(header["dsn"] as string);
  const projectId = dsn.pathname.replace("/", "");

  const sentryUrl = `https://${dsn.hostname}/api/${projectId}/envelope/`;

  const sentryResponse = await fetch(sentryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body: envelope,
  });

  return new NextResponse(null, { status: sentryResponse.status });
}
