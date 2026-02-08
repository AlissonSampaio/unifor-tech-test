import { Locator, Page, expect } from '@playwright/test';
import { MESSAGES, ROUTES, TIMEOUTS } from '../fixtures/test-data';

export class StudentPage {
  readonly page: Page;
  readonly availableClassesCard: Locator;
  readonly myEnrollmentsCard: Locator;
  readonly availableClassesTable: Locator;
  readonly availableClassesRows: Locator;
  readonly enrollmentsTable: Locator;
  readonly enrollmentsRows: Locator;
  readonly enrollButtons: Locator;
  readonly scheduleConflictTags: Locator;
  readonly alreadyEnrolledTags: Locator;

  constructor(page: Page) {
    this.page = page;
    this.availableClassesCard = page.locator('[data-testid="available-classes-card"]');
    this.myEnrollmentsCard = page.locator('[data-testid="enrollments-card"]');
    this.availableClassesTable = page.locator('[data-testid="available-classes-table"]');
    this.availableClassesRows = this.availableClassesTable.locator('tbody tr');
    this.enrollmentsTable = page.locator('[data-testid="enrollments-table"]');
    this.enrollmentsRows = this.enrollmentsTable.locator('tbody tr');
    this.enrollButtons = page.locator('[data-testid="enroll-button"]');
    this.scheduleConflictTags = page.locator('p-tag', { hasText: 'Conflito' });
    this.alreadyEnrolledTags = page.locator('p-tag', { hasText: 'Matriculado' });
  }

  async goto() {
    await this.page.goto(ROUTES.student);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.availableClassesCard.waitFor({ state: 'visible', timeout: TIMEOUTS.navigation });
    await this.myEnrollmentsCard.waitFor({ state: 'visible', timeout: TIMEOUTS.navigation });
  }

  async assertPageDisplayed() {
    await expect(this.availableClassesCard).toBeVisible();
    await expect(this.myEnrollmentsCard).toBeVisible();
    await expect(this.availableClassesTable).toBeVisible();
    await expect(this.enrollmentsTable).toBeVisible();
  }

  async getAvailableClassesCount(): Promise<number> {
    const emptyMessage = this.availableClassesCard.locator('td', {
      hasText: MESSAGES.emptyAvailableClasses,
    });
    if (await emptyMessage.isVisible().catch(() => false)) {
      return 0;
    }
    return await this.availableClassesRows.count();
  }

  async getEnrollmentsCount(): Promise<number> {
    const emptyMessage = this.myEnrollmentsCard.locator('td', {
      hasText: MESSAGES.emptyEnrollments,
    });
    if (await emptyMessage.isVisible().catch(() => false)) {
      return 0;
    }
    return await this.enrollmentsRows.count();
  }

  async enrollInClass(index = 0) {
    const row = this.availableClassesRows.nth(index);
    const enrollButton = row.locator('[data-testid="enroll-button"] button');
    await expect(enrollButton).toBeEnabled({ timeout: TIMEOUTS.assertion });
    await enrollButton.click();
  }

  async assertAvailableClassesHasData() {
    const count = await this.getAvailableClassesCount();
    expect(count).toBeGreaterThan(0);
  }

  async assertAvailableClassesEmpty() {
    await expect(
      this.availableClassesCard.locator('td', { hasText: MESSAGES.emptyAvailableClasses })
    ).toBeVisible();
  }

  async assertEnrollmentsHasData() {
    const count = await this.getEnrollmentsCount();
    expect(count).toBeGreaterThan(0);
  }

  async assertEnrollmentsEmpty() {
    await expect(
      this.myEnrollmentsCard.locator('td', { hasText: MESSAGES.emptyEnrollments })
    ).toBeVisible();
  }

  async hasScheduleConflict(index = 0): Promise<boolean> {
    const row = this.availableClassesRows.nth(index);
    const conflictTag = row.locator('p-tag', { hasText: 'Conflito' });
    return await conflictTag.isVisible().catch(() => false);
  }

  async isAlreadyEnrolled(index = 0): Promise<boolean> {
    const row = this.availableClassesRows.nth(index);
    const enrolledTag = row.locator('p-tag', { hasText: 'Matriculado' });
    return await enrolledTag.isVisible().catch(() => false);
  }

  async canEnroll(index = 0): Promise<boolean> {
    const row = this.availableClassesRows.nth(index);
    const enrollButtonInternal = row.locator('[data-testid="enroll-button"] button');
    return await enrollButtonInternal.isEnabled().catch(() => false);
  }

  async waitForEnrollmentComplete() {
    await this.page.waitForTimeout(1000);
  }

  async assertEnrollmentSuccess() {
    await expect(this.page.locator('.p-toast-message-success, p-toast')).toBeVisible({
      timeout: TIMEOUTS.assertion,
    });
  }

  async getClassName(index = 0): Promise<string> {
    const row = this.availableClassesRows.nth(index);
    const nameCell = row.locator('td').first();
    return (await nameCell.textContent()) || '';
  }
}
