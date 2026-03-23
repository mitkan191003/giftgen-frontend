# GiftGen Frontend

This frontend is a port of the old reference experience onto the current stack:

- Cognito Hosted UI with PKCE for real auth
- FastAPI backend on AWS for creations, jobs, shares, and asset delivery
- Modal generation invoked through the backend
- S3 or local backend storage for generated models

There is no Supabase or frontend-owned API layer in this app anymore. The Next app talks directly to the backend.

## Core Flows

- `/`: sign in through Cognito or use development auth when Cognito is not configured
- `/studio`: generate a gift, poll the backend job, preview the model, and create a share link
- `/my-gifts`: browse the current user’s generated gifts
- `/unwrap` and `/share/[slug]`: load a public or unlisted shared gift and reveal it in the 3D viewer

## Environment

Copy `.env.example` to `.env.local` and fill in the real values for the environment you are running:

```bash
cp .env.example .env.local
```

Variables:

- `NEXT_PUBLIC_BACKEND_URL`: base URL for the FastAPI backend, for example `https://api-dev.giftgen.mithrak.com`
- `NEXT_PUBLIC_BACKEND_AUTH_MODE`: `cognito` for deployed environments, `development` only for local fallback mode
- `NEXT_PUBLIC_AUTH_MODE`: `development` or `cognito`
- `NEXT_PUBLIC_COGNITO_DOMAIN`: Cognito Hosted UI domain
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`: Cognito app client id for the frontend
- `NEXT_PUBLIC_COGNITO_REDIRECT_URI`: exact callback URL registered in Cognito
- `NEXT_PUBLIC_COGNITO_LOGOUT_URI`: exact logout URL registered in Cognito
- `NEXT_PUBLIC_SENTRY_DSN`: optional browser-side Sentry DSN
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`: optional frontend Sentry environment label
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`: optional frontend trace sampling rate
- `SENTRY_DSN`: optional server-side Sentry DSN for Next.js runtime errors
- `SENTRY_ENVIRONMENT`: optional server-side Sentry environment label
- `SENTRY_TRACES_SAMPLE_RATE`: optional server-side trace sampling rate

Deployed environment recommendation:

- Dev, staging, and prod should all use `NEXT_PUBLIC_AUTH_MODE=cognito`
- Dev, staging, and prod should all use `NEXT_PUBLIC_BACKEND_AUTH_MODE=cognito`
- `development` mode should only be used for local iteration when you intentionally are not using Cognito

## Development

```bash
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run build
```

## Notes

- The reference 3D experience, studio layout, unwrap flow, and share flow were kept and adapted to the current backend contracts.
- Asset rendering now depends on backend asset URLs rather than direct storage-provider URLs.
- The frontend now sends the Cognito ID token as the backend bearer token when backend auth mode is `cognito`.
- The frontend now generates an `X-Request-Id` for every backend request so browser failures can be correlated with API logs.
- Sentry is wired for App Router projects but remains dormant until the DSN env vars are set.
