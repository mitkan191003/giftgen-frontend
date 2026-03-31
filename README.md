# GiftGen Frontend

GiftGen Frontend is the user-facing web application for GiftGen.

It is a Next.js app that handles sign-in, the prompt-to-generation experience, 3D preview and share pages, and the general browsing experience around finished gifts. In production it is designed to live on Vercel and talk directly to the backend API.

## Related Repositories

- [giftgen-backend](https://github.com/mitkan191003/giftgen-backend): the API, worker, and deployment chart
- [giftgen-infra](https://github.com/mitkan191003/giftgen-infra): Terraform and delivery infrastructure for AWS, ArgoCD, Cognito, DNS, and environment setup

## Where This Repo Fits

This repository is the presentation layer of the project.

Its job is to:

- handle sign-in and session UX
- guide the user through the gift creation flow
- submit generation requests to the backend
- poll for job completion
- render generated 3D assets
- expose personal gift history and public share pages

The frontend does not own the application database and it does not talk directly to generation providers. That work happens in the backend. The frontend’s role is to make that flow usable and understandable.

## Main Areas of the App

- `/` for landing and sign-in
- `/studio` for creation and generation
- `/my-gifts` for the authenticated library view
- `/share/[slug]` and related share routes for public or unlisted gift pages

## Getting Started

### Requirements

- Node.js 20+
- `pnpm`

### Local Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Point the frontend at a running backend.
4. Start the development server.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The default local setup expects a backend running at `http://localhost:8000`.

## Configuration

The main environment variables are:

- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_BACKEND_AUTH_MODE`
- `NEXT_PUBLIC_AUTH_MODE`
- `NEXT_PUBLIC_COGNITO_DOMAIN`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_REDIRECT_URI`
- `NEXT_PUBLIC_COGNITO_LOGOUT_URI`

For local work, the app can run in development auth mode. For deployed environments, it is intended to use Cognito-backed authentication and a real backend URL.

## Deployment

This repository is intended for Vercel deployment.

In the full project architecture:

- Vercel serves the Next.js app
- the backend runs separately on AWS
- Cognito handles authentication
- generated assets are retrieved through backend-managed routes

That split keeps the frontend focused on user experience rather than platform orchestration.

## Tech Stack

- Next.js
- React
- TypeScript
- Three.js via React Three Fiber and Drei
- Cognito Hosted UI for authentication
- Sentry support for frontend error monitoring

## Further Reading

- [.env.example](.env.example)
