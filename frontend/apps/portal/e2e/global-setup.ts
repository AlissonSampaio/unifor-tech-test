import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-data';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.join(__dirname, '.auth');
const coordinatorAuthFile = path.join(authDir, 'coordinator.json');
const studentAuthFile = path.join(authDir, 'student.json');

setup('authenticate as coordinator', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto('/');
  await page.waitForSelector('#username', { timeout: 30000 });
  await page.locator('#username').fill(TEST_USERS.coordinator.username);
  await page.locator('#password').fill(TEST_USERS.coordinator.password);
  await page.locator('#kc-login').click();
  await page.waitForURL(/localhost:4200/, { timeout: 30000 });
  await expect(page.locator('app-root')).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: coordinatorAuthFile });
});

setup('authenticate as student', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto('/');
  await page.waitForSelector('#username', { timeout: 30000 });
  await page.locator('#username').fill(TEST_USERS.student.username);
  await page.locator('#password').fill(TEST_USERS.student.password);
  await page.locator('#kc-login').click();
  await page.waitForURL(/localhost:4200/, { timeout: 30000 });
  await expect(page.locator('app-root')).toBeVisible({ timeout: 15000 });
  await page.context().storageState({ path: studentAuthFile });
});
