# E2E Test Plan

This plan turns our TODO checklist into an executable end‑to‑end suite. It favors user‑visible flows, role & auth gates, and critical UX behaviors. Non‑UI concerns (lint/typecheck) are covered in CI jobs rather than browser tests.

## Principles

- Keep tests deterministic: stable time (local Y‑M‑D), test auth route, minimal network flakiness.
- Prefer role‑based fixtures (ADMIN, MANAGER, USER) over deep DB seeding.
- Use accessible selectors (roles, labels) instead of CSS.
- Keep flows short; one assert of each critical behavior per page.

## Environment & Fixtures

- Base URL: `http://localhost:3000` (Playwright webServer config).
- Sign‑in: `POST /api/test-auth/signin` (dev‑only) with header `x-test-auth`.
- Roles: sign in as ADMIN/MANAGER/USER by passing `role`.
- Time: build Y‑M‑D strings in local TZ for “today”.

## Suites & Scenarios

### 1) Auth & Session (auth.spec.ts)

- Sign in via test route → land on Dashboard (USER).
- Calendar modal: keyboard “t” opens today modal; save quick note (today‑only).
- Sign out returns to Sign in.

### 2) Diary (diary.spec.ts)

- Create today entry: set emotion sliders, one urge, and notes; Save; redirect to History.
- History shows today’s row with notes.
- Calendar shows indicator on today; modal opens read‑only for past dates.

### 3) Dashboard (dashboard.spec.ts)

- Date pickers (Start/End) update URL (shallow).
- WeeklySummary: entries/skills/emotions numbers render.
- Charts render with data after at least one entry:
  - EmotionChart: `canvas` visible and legend present.
  - SkillsFrequency: bar chart `canvas` visible.
- UrgeHeatmap: table visible; cells render for days in range.

### 4) Calendar (calendar.spec.ts)

- Month navigation (prev/next) updates grid; Today button jumps to current month.
- Keyboard navigation (arrows) moves focus; Enter opens modal for focused date.

### 5) Export (export.spec.ts)

- Export CSV on History: triggers a file download with expected filename.
- Print export page `/export/print`: renders entries for default last 30 days.

### 6) Invites & Magic Links (invite.spec.ts)

- Admin creates invite → shows magic link; visiting link auto‑creates user, logs in, redirects.
- Error handling: already consumed / expired invite redirects to fallback (manual accept page) — planned once expiration control added.
- Email mismatch guidance: manual accept shows mismatch flow if signed in as different email.

### 7) Admin Org (admin.org.spec.ts)

- List members visible for Admin.
- Change role USER→MANAGER and back; assignment to a manager for USER.
- Aggregates sections render (Managers/User 7d summaries).

### 8) Manager Views (manager.spec.ts)

- Manager can view only assigned users’ summaries and recent entries.
- Access to other managers’ users is forbidden.

### 9) RBAC & Guards (rbac.spec.ts)

- USER cannot access `/admin/org` (redirect or unauthorized).
- MANAGER cannot access Admin‑only pages; can access manager pages.

### 10) A11y & Keyboard (a11y.spec.ts)

- Calendar grid has `role=grid`; day cells have `aria-current` for today.
- Modal is focus‑trapped (now via MUI Dialog); Escape/backdrop closes.
- Buttons/inputs have labels; Info tooltips accessible by title.
- Optional: integrate `@axe-core/playwright` for a basic violations check on key pages.

### 11) Dark Mode (darkmode.spec.ts)

- Toggle theme icon switches mode; preference persists across reloads via localStorage.
- Key surfaces (AppBar/background) change palette.

### 12) Health Checks (health.spec.ts)

- `GET /api/ping` returns OK.
- `GET /api/health/db` returns OK when DB reachable (in CI Postgres job).

## Mapping to TODOs

- P0 CI/CD: Covered by e2e job and health.spec smoke.
- P1 UI/UX: diary, calendar, modal, dashboard panels, dark mode toggling.
- P1 Analytics: EmotionChart & SkillsFrequency canvas presence post‑entry; heatmap grid.
- P1 Export: CSV download presence; print export page content.
- P1 Invites: magic link acceptance.
- P2 i18n: add once strings are wrapped in `t()`.
- P2 A11y: modal focus and grid roles; add axe‑checks later.
- P3 Product: preferences (theme/timezone) once page exists.
- P4+ Notifications/PWA: future; out of scope for e2e now.

## Test Data Strategy

- Avoid global state: create unique emails per test run using timestamp.
- Use daily cleanup script in scheduled job; or run invite/user cleanup per spec if needed.

## Selectors Strategy

- Prefer: `getByRole('button', { name: /Save/ })`, `getByLabel('Start')`, `getByRole('grid')`.
- Avoid: brittle CSS or text prone to copy changes.

## CI Considerations

- Run linters/format before e2e (already configured).
- Postgres service + Prisma push/seed before tests.
- Optional: shard specs; retry failed specs once; emit JUnit for PR annotations.

## Next Steps

- Add `@axe-core/playwright` to a11y.spec once ready.
- Add download assertion to export.spec to validate CSV content (filename + size).

## Next Steps

- Implement test stubs (now added as skipped tests) and fill incrementally.
- Add `@axe-core/playwright` to a11y.spec once ready.
- Add download assertion to export.spec to validate CSV content (filename + size).
