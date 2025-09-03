import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  fullyParallel: true,
  // Assume local dev at 3000; override with BASE_URL env var if needed
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    // In CI, run against built app; locally, run dev server
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      // CRITICAL: Playwright webServer doesn't inherit env vars by default
      // Must explicitly pass all environment variables needed by the server
      NODE_ENV: process.env.CI ? 'test' : process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL || '',
      DATABASE_URL_DIRECT: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL || '',
      AUTH_SECRET: process.env.AUTH_SECRET || '',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      TEST_AUTH_SECRET: process.env.TEST_AUTH_SECRET || 'dev',
      CI: process.env.CI || 'false',
      // Pass through any other env vars that might be needed
      ...(process.env.VERCEL ? { VERCEL: process.env.VERCEL } : {}),
      ...(process.env.VERCEL_URL ? { VERCEL_URL: process.env.VERCEL_URL } : {}),
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
