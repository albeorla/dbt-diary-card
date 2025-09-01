# Project TODOs and Roadmap

This is the authoritative backlog and execution order. Items are grouped by priority. Checkbox state reflects current status.

Legend: [ ] pending · [~] in progress · [x] completed

## P0 — CI/CD & Deployments

- [x] Add Postgres service to CI e2e workflow (services + healthcheck)
- [ ] Ensure CI e2e runs green on PR and main
- [x] Add deploy workflow for Vercel preview (PR) and production (main) using secrets
- [ ] Protect production deploy to only happen on green e2e
- [ ] Document required CI/CD secrets and env vars
- [ ] Ensure test and production Vercel deployments are using passing builds

## P0 — Type Safety & Linting

- [x] Fix `npm run typecheck` errors (Next API route typing, exclude scripts)
- [x] Add ESLint via Next config and CI lint step
- [x] Add Prettier with format check
- [x] Add Husky + lint-staged pre-commit hook

## P1 — UI/UX (MUI)

- [x] Add MUI ThemeProvider + CssBaseline
- [x] AppBar/Toolbar/Container for header layout
- [x] Dark mode toggle with local preference
- [x] Convert diary surfaces to Paper + MUI buttons
- [x] Convert calendar EntryModal to MUI Dialog
- [x] Convert dashboard panels to Paper + Typography
- [x] Convert Notes to MUI TextField (multiline)
- [ ] Convert emotion/urge sliders to MUI Slider + Checkbox, keep a11y labels

## P1 — Analytics & Charts

- [x] Integrate Chart.js via `react-chartjs-2` for emotion trends
- [x] Bar chart for skills frequency
- [ ] Chart polish: legend/tooltip configs, responsive heights, color tokens

## P1 — Export & Reporting

- [x] Print-friendly export page with entries
- [ ] Add range selector on export print page (URL query)
- [ ] Include top emotions/urges/skills per day in print export

## P1 — Invites & Magic Links

- [x] Magic link accept route auto-creates user, consumes invite, sets session
- [x] Update email invite to send magic link
- [ ] Resend/revoke invites from Admin UI
- [ ] Email templates: branded HTML + text fallback

## P2 — i18n & Copy

- [x] i18n scaffolding (`t()`/`setLocale()`)
- [ ] Replace visible strings with `t()` progressively
- [ ] Language selector and persistence

## P2 — Accessibility

- [x] Focus trap and keyboard support in modals (now via MUI)
- [ ] A11y audit: roles, aria labels, focus outlines, color contrast
- [ ] Fix findings; document patterns

## P3 — Observability & Quality

- [ ] Sentry error + performance monitoring
- [ ] Structured logs in API routes (request IDs)
- [ ] Flake guard in CI (retry failed e2e once; junit output)

## P3 — Product

- [ ] User preferences page (theme, timezone, notifications)
- [ ] Dashboard quick filters and saved ranges

## P4 — Notifications & PWA

- [ ] Email reminders (cron) with opt-in preferences
- [ ] PWA install + offline diary capture and sync

## P5 — Data & Security

- [ ] RBAC hardening and audit trail for admin changes
- [ ] Privacy: data export and delete account flows

## Maintenance

- [x] E2E dev sign-in route for tests
- [x] E2E invite + diary flows covered
- [x] Daily cleanup script for e2e users
- [ ] Schedule cleanup (cron/Actions) in prod/test envs

---

## CI/CD Setup Checklist

- [ ] Set GitHub Action secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (and optional `VERCEL_SCOPE`)
- [ ] Confirm `DATABASE_URL` points to CI Postgres service for e2e
- [ ] Ensure Next auth secrets in CI (`AUTH_SECRET`, `NEXTAUTH_URL`)
- [ ] Gate production deploy on green e2e status
- [ ] Vercel project connected to repo (Preview on PRs, Production on main)

## Vercel Deploy Checklist

- [ ] Test environment (Preview): env vars set (NEXTAUTH_URL, DATABASE_URL, SMTP, etc.)
- [ ] Production environment: env vars set, domain configured, protection rules
- [ ] Healthcheck route available (`/api/health/db`) returns 200
- [ ] Post-deploy smoke: sign-in, diary save, dashboard loads
