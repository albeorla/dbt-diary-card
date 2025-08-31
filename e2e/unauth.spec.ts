import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', expectText: '' }, // will redirect
  { path: '/dashboard', expectText: 'You must sign in to view the dashboard.' },
  { path: '/calendar', expectText: 'You must sign in to view the calendar.' },
  { path: '/history', expectText: 'You must sign in to view your history.' },
  { path: '/export', expectText: 'You must sign in to export your data.' },
  { path: '/diary', expectText: 'You must sign in to view your diary card.' },
];

for (const p of pages) {
  test(`unauthenticated sees sign-in prompt at ${p.path}`, async ({ page }) => {
    await page.goto(p.path);
    if (p.expectText) {
      await expect(page.getByText(p.expectText)).toBeVisible();
    } else {
      // Root redirects to signin via index logic; assert we end up there
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    }
  });
}

