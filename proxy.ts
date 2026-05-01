import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/welcome(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/sso-callback(.*)",
  "/api/exchange-rate",
]);

function apiOrigin(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const api = apiOrigin();

  const scriptSrc = isDev
    ? "'self' 'unsafe-eval' 'unsafe-inline'"
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://img.clerk.com https://*.plaid.com https:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${api} https://*.clerk.accounts.dev https://clerk-telemetry.com https://api.clerk.com wss://*.clerk.accounts.dev https://*.plaid.com`,
    `frame-src 'self' https://*.clerk.accounts.dev https://cdn.plaid.com https://challenges.cloudflare.com`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ];

  if (!isDev) directives.push(`upgrade-insecure-requests`);

  return directives
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default clerkMiddleware(async (auth, request) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
