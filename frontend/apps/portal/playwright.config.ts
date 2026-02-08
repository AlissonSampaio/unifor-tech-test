import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const e2ePort = process.env['E2E_PORT'] || '4200';
const baseURL = process.env['BASE_URL'] || `http://localhost:${e2ePort}`;

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './e2e' }),
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI']
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  webServer: {
    command: `npx nx serve portal --port=${e2ePort}`,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    cwd: workspaceRoot,
    timeout: 120000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /global-teardown\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/coordinator.json',
      },
      dependencies: ['setup'],
    },
    ...(process.env['CI']
      ? [
          {
            name: 'firefox',
            use: {
              ...devices['Desktop Firefox'],
              storageState: './e2e/.auth/coordinator.json',
            },
            dependencies: ['setup'],
          },
          {
            name: 'webkit',
            use: {
              ...devices['Desktop Safari'],
              storageState: './e2e/.auth/coordinator.json',
            },
            dependencies: ['setup'],
          },
        ]
      : []),
  ],
});
