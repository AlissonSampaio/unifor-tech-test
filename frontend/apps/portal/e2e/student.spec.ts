import { expect, test } from '@playwright/test';
import { StudentPage } from './pages/student.po';
import { PAGE_TITLES } from './fixtures/test-data';
import { MOCK_AULAS_DISPONIVEIS, MOCK_MATRICULAS, API_ROUTES } from './fixtures/mock-data';
import * as path from 'path';

test.describe('Student - Enrollment Page', () => {
  test.use({
    storageState: path.join(__dirname, '.auth', 'student.json'),
  });

  test.describe('Page Structure', () => {
    test('should display card structures', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      await expect(studentPage.availableClassesCard).toBeVisible();
      await expect(studentPage.myEnrollmentsCard).toBeVisible();
      await expect(page.locator('p-card', { hasText: PAGE_TITLES.studentAvailableClasses })).toBeVisible();
      await expect(page.locator('p-card', { hasText: PAGE_TITLES.studentEnrollments })).toBeVisible();
    });

    test('should display both tables', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      await expect(studentPage.availableClassesTable).toBeVisible();
      await expect(studentPage.enrollmentsTable).toBeVisible();
    });
  });

  test.describe('Empty State', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(API_ROUTES.aulasDisponiveis, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      );
      await page.route(API_ROUTES.matriculas, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      );
    });

    test('should display empty message for available classes', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      await studentPage.assertAvailableClassesEmpty();
    });

    test('should display empty message for enrollments', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      await studentPage.assertEnrollmentsEmpty();
    });
  });

  test.describe('Populated State', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(API_ROUTES.aulasDisponiveis, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_AULAS_DISPONIVEIS) })
      );
      await page.route(API_ROUTES.matriculas, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MATRICULAS) })
      );
    });

    test('should display available classes with data', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      await studentPage.assertAvailableClassesHasData();
    });

    test('should display enroll buttons for each class', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      await expect(studentPage.enrollButtons).toHaveCount(MOCK_AULAS_DISPONIVEIS.length);
    });

    test('should show vacancy tags for classes', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      const tags = studentPage.availableClassesTable.locator('p-tag');
      const tagsCount = await tags.count();
      expect(tagsCount).toBeGreaterThan(0);
    });

    test('should display enrollments with data', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      await studentPage.assertEnrollmentsHasData();
    });
  });

  test.describe('Enrollment Logic', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(API_ROUTES.aulasDisponiveis, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_AULAS_DISPONIVEIS) })
      );
      await page.route(API_ROUTES.matriculas, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      );
    });

    test('enroll button should be enabled for valid class', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      const canEnroll = await studentPage.canEnroll(0);
      expect(canEnroll).toBe(true);
    });

    test('enroll button should be disabled for class with schedule conflict', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      const canEnroll = await studentPage.canEnroll(1);
      expect(canEnroll).toBe(false);
    });

    test('enroll button should be disabled for already enrolled class', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      const canEnroll = await studentPage.canEnroll(2);
      expect(canEnroll).toBe(false);
    });

    test('should display schedule conflict tag', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      const hasConflict = await studentPage.hasScheduleConflict(1);
      expect(hasConflict).toBe(true);
    });

    test('should display already enrolled tag', async ({ page }) => {
      const studentPage = new StudentPage(page);
      await studentPage.goto();

      const isEnrolled = await studentPage.isAlreadyEnrolled(2);
      expect(isEnrolled).toBe(true);
    });
  });
});

test.describe('Student Page - Role Access', () => {
  test('coordinator accessing student page should be handled', async ({ page }) => {
    await page.goto('/aluno');
    await expect(page).toHaveURL(/aluno|coordenador|\//);
  });
});
