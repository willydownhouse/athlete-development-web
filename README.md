# Hockey App Web

Next.js frontend for the hockey player development app.

This repo is the mobile-first web client. It handles Google sign-in with Auth.js and talks to the separate Fastify API in `hockey-app-service`.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Auth.js (`next-auth` v5)
- Prisma (shared Postgres schema with the backend)

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

- `DATABASE_URL` — same Postgres database as `hockey-app-service`
- `AUTH_SECRET` — must match the backend service
- `AUTH_URL` — frontend URL, e.g. `http://localhost:3000`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth web client
- `NEXT_PUBLIC_API_URL` — Fastify API URL, e.g. `http://localhost:3001`

Generate the Prisma client:

```bash
yarn db:generate
```

Database migrations are owned by `hockey-app-service`. Run migrations there, not in this repo.

## Development

Start the frontend:

```bash
yarn dev
```

Start the API separately from `hockey-app-service`:

```bash
yarn dev
```

Then open:

- Public home: `http://localhost:3000/`
- Protected test route: `http://localhost:3000/dashboard`

## Auth Flow

1. User clicks **Continue with Google** on `/`
2. Auth.js completes Google OAuth and stores auth records in Postgres
3. Auth.js creates a JWT session signed with `AUTH_SECRET`
4. `/dashboard` reads the JWT and calls `GET /api/auth/me` on the Fastify API
5. The backend validates the JWT and creates/links the app `AppUser`

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
yarn db:generate   # Generate Prisma client
yarn db:studio     # Open Prisma Studio
```

## Google OAuth Redirect URI

For local development, configure this redirect URI in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```
