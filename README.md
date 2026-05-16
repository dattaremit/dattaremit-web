# DattaRemit Web

Customer-facing web app for the DattaRemit remittance platform. Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Clerk auth.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Command                                   | What it does                 |
| ----------------------------------------- | ---------------------------- |
| `npm run dev`                             | Start the Next.js dev server |
| `npm run build`                           | Production build             |
| `npm run start`                           | Run the production build     |
| `npm run lint` / `npm run lint:fix`       | ESLint                       |
| `npm run type-check`                      | `tsc --noEmit`               |
| `npm run format` / `npm run format:check` | Prettier                     |
| `npm run test`                            | Jest                         |
| `npm run knip`                            | Dead-code/unused-export scan |

## Run with Docker

```bash
cp .env.example .env.local       # fill in real values

# Dev (hot reload) — http://localhost:3000
docker compose --env-file .env.local --profile dev up web-dev

# Production-like build & run
docker compose --env-file .env.local up --build web
```

`NEXT_PUBLIC_*` vars are inlined into the client bundle at build time, so they're wired as build args in `docker-compose.yml`. Compose interpolates `${...}` from `.env` by default — pass `--env-file .env.local` so those build args resolve from our local secrets file instead.

> **Do not** use `docker build` + `docker run --env-file .env.local` for the production image. Runtime env vars cannot reach the already-built client bundle, so Clerk falls back to its hosted Account Portal sign-up page instead of our local `/sign-up`. Always build through `docker compose --env-file .env.local` (or pass every `NEXT_PUBLIC_*` value explicitly with `--build-arg`).

`SENTRY_AUTH_TOKEN` is optional — if unset, the build skips source-map upload.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Auth:** Clerk (`@clerk/nextjs`); middleware in `proxy.ts`
- **Data:** TanStack React Query v5 + Axios; centralized query keys in `constants/query-keys.ts`
- **API:** Axios in `services/api.ts` with `x-auth-token` injection, response-envelope unwrapping, and idempotency-key support.
- **Forms:** React Hook Form + Yup
- **UI:** shadcn/ui (Radix UI + Tailwind CSS 4) with CVA variants; fonts: Poppins (primary) and Geist Mono via `next/font/google`
- **State:** Custom persisted stores using `useSyncExternalStore` + `localStorage` (theme, onboarding, notifications)
- **Observability:** Sentry (`@sentry/nextjs`)

## Routing

| Group              | Purpose                        |
| ------------------ | ------------------------------ |
| `app/(auth)/`      | Sign-in / sign-up screens      |
| `app/(dashboard)/` | Authenticated user pages       |
| `app/(marketing)/` | Public landing/marketing pages |
| `app/onboarding/`  | First-time setup flows         |

## Environment

- `NEXT_PUBLIC_API_URL` — backend API base URL (defaults to `http://localhost:5000/api`)
- Clerk env vars (publishable / secret keys)

## Path Alias

`@/*` maps to the project root (`tsconfig.json`).
