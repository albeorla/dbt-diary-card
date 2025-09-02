import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', checkButtonOnly: true }, // will redirect
  { path: '/dashboard' },
  { path: '/calendar' },
  { path: '/history' },
  { path: '/export' },
  { path: '/diary' },
];

for (const p of pages) {
  test(`unauthenticated sees sign-in prompt at ${p.path}`, async ({ page }) => {
    await page.goto(p.path);
    // Be resilient to copy changes across pages; the key affordance is a Sign in button
    await expect(page.getByRole('button', { name: /Sign in/i }).first()).toBeVisible();
  });
}
