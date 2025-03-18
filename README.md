# GiftGen Frontend

Next.js frontend for the gift creation, queue tracking, and sharing experience.

## What This Scaffold Covers

- Marketing landing page with the product story
- Studio page that shows the intended chat-to-generation workflow
- Creations page shaped around queued, running, and completed work
- Share page contract for public and unlisted creations
- Typed mock data that mirrors the backend schema closely enough to swap in real API calls later

## Architecture Direction

- Deploy on Vercel
- Use Cognito hosted login with PKCE
- Keep access tokens out of client storage where possible
- Treat backend data as server state and hydrate via route handlers or server components
- Use polling first for generation status, upgrade to SSE when the backend is ready

## Local Development

1. Install dependencies.
2. Set `NEXT_PUBLIC_BACKEND_URL` if you want to call the backend directly later.
3. Run `npm run dev`.

This initial scaffold uses local mock data so the UI can be iterated independently of AWS infrastructure.
