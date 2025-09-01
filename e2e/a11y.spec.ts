import { test, expect } from '@playwright/test';

async function signIn(page: any, request: any, email = `e2e-a11y-${Date.now()}@example.com`) {
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

test.describe('Accessibility & Keyboard', () => {
  test('Calendar grid has role=grid; today has aria-current', async ({ page, request }) => {
    await signIn(page, request);
    await page.goto('/calendar');
    await expect(page.getByRole('grid', { name: 'Calendar grid' })).toBeVisible();
    // Find today button by aria-current="date"
    const todayButton = page.locator('[aria-current="date"]');
    await expect(todayButton).toBeVisible();
  });

  test('Entry modal has role=dialog and closes with Escape', async ({ page, request }) => {
    await signIn(page, request);
    await page.goto('/calendar');
    // Open today cell
    await page.locator('[aria-current="date"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Escape closes
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('Diary sliders and checkboxes are accessible', async ({ page, request }) => {
    await signIn(page, request);
    await page.goto('/diary');
    // Sliders are reachable via name
    await expect(page.getByRole('slider', { name: 'Joy' })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Anxiety' })).toBeVisible();
    // Checkbox label present
    await expect(page.getByRole('checkbox', { name: /acted on/i })).toBeVisible();
  });
});
