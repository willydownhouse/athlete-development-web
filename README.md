# Athlete Development Web

Next.js frontend for the athlete development service.

This repo is the mobile-first web client. It handles Google sign-in with Auth.js and talks to the separate Fastify API in `athlete-development-service`.

## Tech Stack

- Node.js 24+
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Auth.js (`next-auth` v5)

## Setup

Install dependencies:

```bash
yarn install
```

Create a local environment file:

```bash
cp .env.example .env
```

Required values:

- `AUTH_SECRET` — must match the backend service
- `AUTH_URL` — frontend URL, e.g. `http://localhost:3000`
- `AUTH_TOKEN_SALT` — Auth.js session cookie name/salt; must match the backend service (`authjs.session-token` locally, `__Secure-authjs.session-token` for HTTPS production)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth web client
- `NEXT_PUBLIC_API_URL` — Fastify API URL, e.g. `http://localhost:3001`

The web app does not connect to Postgres directly. Auth identity records are created by the backend on the first authenticated API request.

## Development

Start the frontend:

```bash
yarn dev
```

Start the API separately from `athlete-development-service`:

```bash
yarn dev
```

Then open:

- Public home: `http://localhost:3000/`
- Protected test route: `http://localhost:3000/dashboard`

## Auth Flow

1. User clicks **Continue with Google** on `/`
2. Auth.js completes Google OAuth and stores a signed JWT session cookie
3. The JWT includes stable provider identity claims (`authProvider`, `authProviderAccountId`, `email`, `name`)
4. Protected pages read the JWT and call the Fastify API with `Authorization: Bearer <jwt>`
5. The backend validates the JWT and creates/links `auth_users`, `accounts`, and the app `AppUser`

Only `/` and `/api/auth/*` are public. All other routes require sign-in.

## Scripts

```bash
yarn dev           # Start Next.js dev server
yarn build         # Production build
yarn start         # Run production server
yarn typecheck     # Run TypeScript checks
yarn lint          # Run ESLint
yarn lint:fix      # Run ESLint with auto-fix
yarn format        # Format files with Prettier
yarn format:check  # Check Prettier formatting
yarn knip          # Check for unused files/dependencies
yarn test          # Run tests once
yarn test:watch    # Run tests in watch mode
yarn verify        # Run typecheck, lint, format check, knip, and tests
yarn audit:ci      # Audit production dependencies
```

## Google OAuth Redirect URI

For local development, configure this redirect URI in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

## Deployment

The web deployment only needs auth and API environment variables. It does not need `DATABASE_URL`.

For Vercel preview/dev deployments:

- set `AUTH_SECRET`, `AUTH_TOKEN_SALT`, Google OAuth credentials, and `NEXT_PUBLIC_API_URL`
- keep `trustHost: true` in Auth.js so preview URLs work
- configure the backend `CORS_ORIGIN` and Google redirect URI for the deployed frontend URL

Database migrations and auth persistence live in `athlete-development-service`.
