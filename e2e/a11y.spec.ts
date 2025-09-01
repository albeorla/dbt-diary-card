import { test } from '@playwright/test';

test.describe('Accessibility & Keyboard', () => {
  test('Calendar grid has role=grid; today has aria-current', () => {
    test.skip();
  });
  test('Modal is focus-trapped; Escape/backdrop closes', () => {
    test.skip();
  });
  test('Buttons/inputs have accessible labels', () => {
    test.skip();
  });
  test('Axe-core scan has no critical violations (future)', () => {
    test.skip();
  });
});
