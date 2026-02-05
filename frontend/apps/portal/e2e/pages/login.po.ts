import { Locator, Page, expect } from '@playwright/test';
import { TEST_USERS, TIMEOUTS } from '../fixtures/test-data';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#kc-login');
    this.errorMessage = page.locator('.alert-error, #input-error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForKeycloakPage() {
    await this.usernameInput.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.navigation,
    });
  }

  async isOnKeycloakPage(): Promise<boolean> {
    try {
      await this.usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async fillCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submitLogin() {
    await this.loginButton.click();
  }

  async login(
    username: string = TEST_USERS.coordinator.username,
    password: string = TEST_USERS.coordinator.password
  ) {
    if (await this.isOnKeycloakPage()) {
      await this.fillCredentials(username, password);
      await this.submitLogin();
      await this.page.waitForURL(/localhost:4200(?!.*realms)/, {
        timeout: TIMEOUTS.navigation,
      });
    }
  }

  async attemptLogin(username: string, password: string) {
    if (await this.isOnKeycloakPage()) {
      await this.fillCredentials(username, password);
      await this.submitLogin();
    }
  }

  async loginAsCoordinator() {
    await this.login(
      TEST_USERS.coordinator.username,
      TEST_USERS.coordinator.password
    );
  }

  async loginAsStudent() {
    await this.login(TEST_USERS.student.username, TEST_USERS.student.password);
  }

  async assertLoginSuccessful() {
    await expect(this.page.locator('app-root')).toBeVisible({
      timeout: TIMEOUTS.assertion,
    });
    await expect(this.page).not.toHaveURL(/realms/);
  }

  async assertLoginFailed() {
    await expect(this.errorMessage).toBeVisible({
      timeout: TIMEOUTS.assertion,
    });
  }
}
