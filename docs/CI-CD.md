# CI/CD with E2E Gating and Vercel Deploys

This project deploys to Vercel only after end-to-end (E2E) tests pass.

## What Runs Where

- `.github/workflows/e2e.yml`
  - `checks` job: installs deps and runs the standard checks
    - `npm run format:check`
    - `npm run typecheck`
    - `npm run lint`
    - `npm run build`
  - `e2e` job: spins up Postgres service, downloads the built app artifact, generates Prisma client, pushes schema/seeds DB, and runs `npm run test:e2e` against `next start`.
  - `migrate` job: calls the reusable migration workflow on `main` after checks and E2E complete. Does not block if DB is not reachable from Actions; prints a notice.
  - `deploy_preview` job: runs on Pull Requests after both `checks` and `e2e` succeed. Builds with Vercel CLI and deploys a Preview.
  - `deploy_production` job: runs on pushes to `main` after `checks`, `e2e`, and `migrate` complete. Builds and deploys to Production.

## Required GitHub Action Secrets

- `VERCEL_TOKEN`: Vercel personal token.
- `VERCEL_ORG_ID`: Vercel org id for the project.
- `VERCEL_PROJECT_ID`: Vercel project id.
- Optional for CI DB: `NEON_DEV_DATABASE_URL` (when set, E2E uses Neon; otherwise local service is used).
- Optional for migration: `DATABASE_URL` (direct database connection string, e.g. Neon direct URL). If omitted or blocked, the migration step will be skipped with a notice.

Add secrets in GitHub → Settings → Secrets and variables → Actions.

## Required App Environment Variables

Ensure these are set in Vercel (Preview and Production) and in GitHub Actions when building locally in CI:

- `AUTH_SECRET`: 32+ char secret for NextAuth.
- `DATABASE_URL`: PostgreSQL connection string (include pooling params for managed DBs); CI uses the Postgres service if `NEON_DEV_DATABASE_URL` is not set.
- `NEXTAUTH_URL`: Full site URL for production (no trailing slash), e.g. `https://dbt-diarycard.vercel.app`.

Tip: `vercel pull` (in the workflow) fetches env for the given environment.

## How Deploy Gating Works

- The deploy jobs declare `needs: e2e` and are conditioned on the GitHub event:
  - Pull Requests → `deploy_preview`
  - Push to `main` → `deploy_production`
- Vercel CLI steps:
  1. `vercel pull` for target env (preview/production) using org/project IDs
  2. `vercel build` (or `--prod`)
  3. `vercel deploy --prebuilt` (or `--prod`)

This ensures the exact code that passed tests is what gets deployed.

## Optional: Branch Protection

To enforce E2E success before merging:

1. GitHub → Settings → Branches → Branch protection rules → `main`.
2. Require status checks to pass → add the `e2e` job from `E2E Tests` workflow.

## Troubleshooting

- Missing env in build: verify `VERCEL_*` secrets and that `vercel pull` runs for the correct environment.
- Vercel build failures: inspect the build logs printed by the workflow; replicate locally with `vercel build`.
- PRs from forks: secrets are not exposed to forked PRs. Preview deploy will be skipped unless you trust the fork or run a manual deploy.
