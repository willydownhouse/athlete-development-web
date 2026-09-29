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

### Docker

The production image uses Next.js [`output: "standalone"`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) when `VERCEL` is unset. Vercel builds stay on the default output so they still emit `next-server.js.nft.json`. `NEXT_PUBLIC_API_URL` is baked in at build time from the build-arg. Auth and Google secrets are runtime only and must not be copied into the image.

Load `.env` first so the build-arg picks up `NEXT_PUBLIC_API_URL`, then pass the same file into the container:

```bash
set -a && source .env && set +a

docker build -t athlete-development-web:local \
  --build-arg NEXT_PUBLIC_API_URL \
  .

docker run --rm --network host --env-file .env athlete-development-web:local
```

`--network host` is required when the API runs on the host. With the default bridge network, `localhost` inside the container is the container itself, so baked `NEXT_PUBLIC_API_URL=http://localhost:3001` never reaches your machine. Host networking also binds the app on port `3000` directly, so stop `yarn dev` first if that port is already taken.

Configure the backend `CORS_ORIGIN` and the Google OAuth redirect URI for the deployed frontend URL:

```text
https://acent.app/api/auth/callback/google
```

### Production Docker stack (Hetzner)

This stack is **web + nginx only**. Run it on a **separate VPS** from the API: the API host already binds 80 and 443. `NEXT_PUBLIC_API_URL` is baked into the image at build time (`https://api.acent.app`). Auth and Google secrets are runtime-only in `.env.prod`.

nginx adds HSTS, content-type, referrer, framing, partial CSP, and permissions-policy
headers to HTTPS responses. The partial CSP blocks framing, plugins, and untrusted
base URLs without imposing script rules that would break Next.js inline bootstrap
scripts. Next.js also disables its `X-Powered-By` response header.

1. Copy `.env.prod.example` to `.env.prod` and set `AUTH_SECRET`, `AUTH_TOKEN_SALT` (must match the API), `AUTH_URL=https://acent.app`, and Google OAuth credentials. Point DNS for `acent.app` at this VPS.
2. Issue a Let's Encrypt cert for `acent.app` **before** nginx HTTPS will start (`certbot certonly --standalone` if nothing is on port 80 yet). Mount paths are `LETSENCRYPT_DIR` and `CERTBOT_WEBROOT_DIR`, same pattern as the API.
3. Set `ATHLETE_DEVELOPMENT_WEB_IMAGE` when starting manually. A `[deploy]` commit on `main` builds and pushes `ghcr.io/<owner>/athlete-development-web` with `NEXT_PUBLIC_API_URL=https://api.acent.app`, then deploys that immutable image tag to the VPS.

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u "<github-user>" --password-stdin
yarn compose:prod:up
```

```bash
curl -fsS https://acent.app/
```

`yarn compose:prod:down` stops the stack.

After nginx is up, switch Certbot to webroot (`-w /var/www/certbot -d acent.app`) so renewals do not need `--standalone`. Copy a deploy hook later so nginx reloads after renew (directory mount of `/etc/letsencrypt`; reload is enough).

Set API `CORS_ORIGIN` to `https://acent.app` when this origin is live.

### CI

Pushes to `dev` and pull requests run verify (tests, production compose, nginx). Image build:

| Event                | Web image build / push to GHCR |
| -------------------- | ------------------------------ |
| Push to `dev`        | skipped                        |
| `[deploy]` on `main` | push `main-<sha>` and `latest` |
| Pull request         | build only; do not push        |

The `[deploy]` workflow uses the `HETZNER_HOST`, `HETZNER_SSH_KEY`, and
`GHCR_TOKEN` repository secrets. It copies the Compose and nginx files to
`/opt/athlete-development-web/`, pulls the exact image tag, starts the stack,
recreates nginx so the copied config is mounted, checks `https://acent.app/`,
and prunes images older than seven days. The target VPS must allow the `deploy`
user to connect over SSH and access Docker.

### Vercel

For Vercel preview/dev deployments:

- set `AUTH_SECRET`, `AUTH_TOKEN_SALT`, Google OAuth credentials, and `NEXT_PUBLIC_API_URL`
- keep `trustHost: true` in Auth.js so preview URLs work
- configure the backend `CORS_ORIGIN` and Google redirect URI for the deployed frontend URL

Database migrations and auth persistence live in `athlete-development-service`.
