import { test, expect } from '@playwright/test';

test('health: ping endpoint returns OK', async ({ request }) => {
  const res = await request.get('/api/ping');
  expect(res.ok()).toBeTruthy();
});

test('health: db endpoint returns OK (when DB reachable)', async ({ request }) => {
  const res = await request.get('/api/health/db');
  expect(res.ok()).toBeTruthy();
});
