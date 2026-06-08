import { NextRequest, NextResponse } from "next/server";

// Sentry envelopes are small (a few KB); anything approaching 1MB is abuse.
const MAX_ENVELOPE_BYTES = 1_048_576; // 1MB

export async function POST(request: NextRequest) {
  // SECURITY FIX (unbounded body): cap the payload via Content-Length before
  // reading/forwarding it, so an authenticated user can't relay arbitrarily
  // large bodies into our Sentry ingestion quota. Per-user/IP rate limiting was
  // intentionally NOT added: the route is auth-gated and the destination is a
  // fixed server-side DSN (small blast radius), and an in-memory limiter would
  // only protect a single instance anyway.
  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > MAX_ENVELOPE_BYTES) {
    return new NextResponse("Payload too large", { status: 413 });
  }

  const envelope = await request.text();

  // Defense in depth: Content-Length can be spoofed/omitted, so re-check the
  // actual body size after reading.
  if (envelope.length > MAX_ENVELOPE_BYTES) {
    return new NextResponse("Payload too large", { status: 413 });
  }

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
