# Frontend Architecture

## Product Shape

The core product loop is:

1. User signs in
2. User refines a gift concept through chat
3. User submits generation
4. User watches job progress
5. User reviews, names, and shares the creation

The UI should make queue state and ownership obvious. Long-running generation is normal behavior, not an error condition.

## Auth Direction

The production path should use Cognito Hosted UI with the authorization code flow and PKCE. This scaffold intentionally leaves auth visual rather than fully wired because the infra and backend pieces need to land first.

## Environment Model

Real environments should use stable custom domains instead of raw Vercel preview URLs.

- Prod: `giftgen.mithrak.com`
- Dev: `dev.giftgen.mithrak.com`
- Staging: `staging.giftgen.mithrak.com`

Vercel preview deployments are still useful for PR review, but Cognito callbacks should point at the stable environment hostnames above. If dev or staging should stay private before launch, add Vercel Deployment Protection on top of normal app auth.

If your Vercel plan does not support enough custom environments for both stable dev and stable staging, use multiple Vercel projects instead of treating preview URLs as the canonical environment URLs.

## Data Access Strategy

The frontend should eventually consume:

- `/api/v1/threads`
- `/api/v1/creations`
- `/api/v1/jobs/{id}`
- `/api/v1/shares`
- `/api/v1/public/shares/{slug}`

For now, the UI uses mock data that already matches those domain concepts so swapping to real fetches is mechanical instead of architectural.

## Rendering Strategy

- Server components for static chrome and initial data loading
- Client components for chat composition, queue polling, and 3D viewer controls
- Share pages should be server rendered for link unfurls and search indexing
