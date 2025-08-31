import { test, expect } from '@playwright/test';

async function signIn(page: any, request: any, email = `e2e-auth-${Date.now()}@example.com`) {
  const res = await request.post('/api/test-auth/signin', {
    data: { email, role: 'USER' },
    headers: { 'x-test-auth': process.env.TEST_AUTH_SECRET || 'dev' },
  });
  const json = await res.json();
  const token = json.sessionToken as string;
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
      httpOnly: false,
      secure: false,
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
  ]);
}

test('signs in via test auth route and reaches dashboard', async ({ page, request }) => {
  await signIn(page, request);
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('can open calendar modal (today) and save quick note', async ({ page, request }) => {
  await signIn(page, request);

  await page.goto('/calendar');
  // Focus grid and press "t" to jump to today and open modal
  await page.getByRole('grid', { name: 'Calendar grid' }).focus();
  await page.keyboard.press('t');
  // Modal should appear
  await expect(page.getByRole('dialog', { name: /Entry/i })).toBeVisible();

  const textarea = page.locator('textarea');
  await textarea.fill('Quick note from Playwright');
  const saveBtn = page.getByRole('button', { name: 'Save notes' });
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
  }
  await expect(page.getByRole('dialog', { name: /Entry/i })).toBeHidden({ timeout: 3000 });
});
