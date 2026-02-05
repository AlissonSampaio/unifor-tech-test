import { expect, test } from '@playwright/test';
import { LoginPage } from './pages/login.po';
import { ROUTES } from './fixtures/test-data';

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should redirect unauthenticated user to Keycloak', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await page.goto('/');
    await expect(page).toHaveURL(/realms\/unifor/, { timeout: 30000 });
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should login successfully as coordinator', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.waitForKeycloakPage();
    await loginPage.loginAsCoordinator();
    await loginPage.assertLoginSuccessful();
    await page.goto(ROUTES.coordinator);
    await expect(page).toHaveURL(/coordenador/);
  });

  test('should login successfully as student', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.waitForKeycloakPage();
    await loginPage.loginAsStudent();
    await loginPage.assertLoginSuccessful();
    await page.goto(ROUTES.student);
    await expect(page).toHaveURL(/aluno/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.waitForKeycloakPage();
    await loginPage.attemptLogin('invalid_user', 'invalid_password');
    await expect(page).toHaveURL(/realms\/unifor/);
    await loginPage.assertLoginFailed();
  });
});

test.describe('Session Management', () => {
  test('authenticated user can access protected routes', async ({ page }) => {
    await page.goto(ROUTES.coordinator);
    await expect(page).not.toHaveURL(/realms/);
    await expect(page).toHaveURL(/coordenador/);
  });
});
