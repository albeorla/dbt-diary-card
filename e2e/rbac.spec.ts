import { test } from '@playwright/test';

test.describe('RBAC & Guards', () => {
  test('USER cannot access /admin/org (redirect or unauthorized)', () => {
    test.skip();
  });
  test('MANAGER cannot access Admin-only pages; can access manager pages', () => {
    test.skip();
  });
});
