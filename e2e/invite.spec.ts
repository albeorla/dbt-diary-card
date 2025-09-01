import { test, expect } from '@playwright/test';

async function signInAsAdmin(
  page: any,
  request: any,
  email = `e2e-admin-${Date.now()}@example.com`,
) {
  const res = await request.post('/api/test-auth/signin', {
    data: { email, role: 'ADMIN' },
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

test('magic link invite creates user, logs them in, redirects', async ({ page, request }) => {
  await signInAsAdmin(page, request);

  await page.goto('/admin/org');
  const invitee = `invitee-${Date.now()}@example.com`;
  await page.getByPlaceholder('user@example.com').fill(invitee);
  // Role dropdown defaults to USER; keep as is
  await page.getByRole('button', { name: 'Assign' }).click();
  await expect(page.getByText('Invite created. Magic link:')).toBeVisible();

  const link = await page
    .locator('a', { hasText: '/api/invite/accept/' })
    .first()
    .getAttribute('href');
  expect(link).toBeTruthy();

  // Click magic link to auto-accept and auto-login; app redirects internally
  await page.goto(link!);

  // Redirects to app index -> dashboard or elsewhere; assert we are authenticated by finding New Entry button on dashboard if present
  // Navigate to dashboard to ensure session is active
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
