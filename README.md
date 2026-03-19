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
- `NEXT_PUBLIC_BACKEND_AUTH_MODE`: `development` until the backend verifies Cognito JWTs, then `cognito`
- `NEXT_PUBLIC_AUTH_MODE`: `development` or `cognito`
- `NEXT_PUBLIC_COGNITO_DOMAIN`: Cognito Hosted UI domain
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`: Cognito app client id for the frontend
- `NEXT_PUBLIC_COGNITO_REDIRECT_URI`: exact callback URL registered in Cognito
- `NEXT_PUBLIC_COGNITO_LOGOUT_URI`: exact logout URL registered in Cognito

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
- Until backend JWT validation is implemented, Cognito-authenticated users can still bridge into the current development auth mode by setting `NEXT_PUBLIC_BACKEND_AUTH_MODE=development`.
