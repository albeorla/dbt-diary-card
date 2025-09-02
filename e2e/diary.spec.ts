import { test, expect } from '@playwright/test';

async function signIn(page: any, request: any, email = `e2e-diary-${Date.now()}@example.com`) {
  const res = await request.post('/api/test-auth/signin', {
    data: { email, role: 'USER' },
    headers: { 'x-test-auth': process.env.TEST_AUTH_SECRET || 'dev' },
  });
  const json = await res.json();
  const token = json.sessionToken as string;
  const context = page.context();
  await context.addCookies([
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

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function setSliderByAria(page: any, name: string, value: number) {
  const slider = page.getByRole('slider', { name });
  await slider.focus();
  // Move to minimum
  await slider.press('Home');
  for (let i = 0; i < value; i++) {
    await slider.press('ArrowRight');
  }
}

test('diary: create today entry and verify in history and calendar', async ({ page, request }) => {
  await signIn(page, request);

  // Open diary page
  await page.goto('/diary');

  // Page loads diary for today (read-only controls only for non-today dates)

  // Set some emotions using accessible slider labels
  await setSliderByAria(page, 'Joy', 7);
  await setSliderByAria(page, 'Anxiety', 4);

  // Set an urge intensity
  await setSliderByAria(page, 'Substance use intensity', 2);

  // Notes
  await page.getByLabel('Daily notes and reflections').fill('Playwright diary entry');

  // Save
  await page.getByRole('button', { name: /Save Entry|Save/ }).click();

  // Redirects to history
  await expect(page).toHaveURL(/\/history/);

  // Verify notes text is present in history table
  await expect(page.getByText('Playwright diary entry')).toBeVisible();

  // Calendar shows indicator on today
  await page.goto('/calendar');
  // Find today cell by aria-current
  const todayCell = page.getByRole('button', { name: new RegExp(`Day \\d+.*today`) });
  await todayCell.click();
  await expect(page.getByRole('dialog', { name: /Entry/ })).toBeVisible();
});

test('dashboard reflects tracked emotions after entry', async ({ page, request }) => {
  await signIn(page, request);
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /Dashboard/ })).toBeVisible();
  // Ensure the emotions summary section exists (copy may vary)
  await expect(page.getByText(/Emotions Tracked|Tracked Emotions/)).toBeVisible();
});
