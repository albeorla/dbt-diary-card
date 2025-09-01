Local Development (Auth + Ports)

- Goal: run locally with Google OAuth across ports 3000–3002 without fiddling every time.

Prereqs

- Google OAuth credentials in `.env.local`: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
- Strong `AUTH_SECRET` in `.env.local` (>= 32 chars).
- `DATABASE_URL` points to your local Postgres.

Important

- Do NOT set `NEXTAUTH_URL` in local dev. Leaving it unset lets NextAuth use the actual incoming host/port, which is required if you switch between 3000/3001/3002.
- Ensure your Google OAuth client has each redirect URI added exactly:
  - http://localhost:3000/api/auth/callback/google
  - http://localhost:3001/api/auth/callback/google
  - http://localhost:3002/api/auth/callback/google

Run the app

- Spin up Postgres (if using Docker): `docker-compose up -d db`
- Apply schema (first time): `npx prisma db push`
- Start on a specific port (auto‑unsets `NEXTAUTH_URL` for dev):
  - `npm run dev:3000` or `npm run dev:3001` or `npm run dev:3002`

Auth debugging

- Toggle verbose NextAuth logs by setting `AUTH_DEBUG=true` in `.env.local`.
- Visit `/api/auth/debug` to inspect sanitized auth/config values.

Quick checks

- Visit `/api/auth/verify-oauth` on the chosen port. It should report no critical issues and show the exact redirect URI NextAuth will use.
- Go to `/signin` and use “Continue with Google”.

Common fixes

- If you’re stuck in a loop or get a callback mismatch:
  - Clear cookies for `localhost`.
  - Confirm you used the same port to run the app and in Google’s redirect URI.
  - Make sure `NEXTAUTH_URL` is not set in `.env.local`.

Notes

- We added dev scripts in `package.json` that automatically unset `NEXTAUTH_URL` for local runs (`dev:auto`, `dev:3000`, `dev:3001`, `dev:3002`).
- The `scripts/verify-env.js` script now treats `NEXTAUTH_URL` as optional in development.
- Env precedence: `.env.local` overrides `.env`. The dev scripts set `NEXTAUTH_URL=` (empty) for the process; with `emptyStringAsUndefined` enabled, that behaves as unset to keep ports flexible.
