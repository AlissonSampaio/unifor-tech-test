import { expect, test } from '@playwright/test';
import { API_ROUTES, MOCK_MATRIZ_CURRICULAR } from './fixtures/mock-data';
import { DIALOG_TITLES } from './fixtures/test-data';
import { CoordinatorPage } from './pages/coordinator.po';

test.describe('Coordinator - Matriz Curricular', () => {
  test.describe('Page Display', () => {
    test('should display page title and main elements', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.assertPageDisplayed();
    });

    test('should display the class table', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await expect(coordinatorPage.classTable).toBeVisible();
    });

    test('should display filter controls', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await expect(coordinatorPage.periodoFilter).toBeVisible();
      await expect(coordinatorPage.cursoFilter).toBeVisible();
    });

    test('should display "Nova Aula" button', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await expect(coordinatorPage.newClassButton).toBeVisible();
      await expect(coordinatorPage.newClassButton).toBeEnabled();
    });
  });

  test.describe('New Class Dialog', () => {
    test('should open new class dialog when clicking "Nova Aula"', async ({
      page,
    }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.openNewClassDialog();
      await coordinatorPage.assertDialogOpen(DIALOG_TITLES.newClass);
    });

    test('should display all form fields in the dialog', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.openNewClassDialog();
      await expect(coordinatorPage.disciplinaSelect).toBeVisible();
      await expect(coordinatorPage.professorSelect).toBeVisible();
      await expect(coordinatorPage.horarioSelect).toBeVisible();
      await expect(coordinatorPage.maxAlunosInput).toBeVisible();
      await expect(coordinatorPage.cursosMultiSelect).toBeVisible();
    });

    test('should close dialog when clicking "Cancelar"', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.openNewClassDialog();
      await coordinatorPage.closeDialog();
      await expect(coordinatorPage.dialogContent).toBeHidden();
    });

    test('save button should be disabled when form is invalid', async ({
      page,
    }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.openNewClassDialog();
      const isDisabled = await coordinatorPage.isSaveButtonDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('Empty Table State', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(API_ROUTES.matriz, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        }),
      );
    });

    test('should display empty message when no classes exist', async ({
      page,
    }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.assertTableEmpty();
    });
  });

  test.describe('Populated Table State', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(API_ROUTES.matriz, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_MATRIZ_CURRICULAR),
        }),
      );
    });

    test('should display classes in table', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.assertTableHasData();
    });

    test('should have edit button for each row', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      const editButtonCount = await coordinatorPage.editButtons.count();
      expect(editButtonCount).toBe(MOCK_MATRIZ_CURRICULAR.length);
    });

    test('should have delete button for each row', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      const deleteButtonCount = await coordinatorPage.deleteButtons.count();
      expect(deleteButtonCount).toBe(MOCK_MATRIZ_CURRICULAR.length);
    });

    test('should open edit dialog with "Editar Aula" title', async ({
      page,
    }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.editClass(0);
      await coordinatorPage.assertDialogOpen(DIALOG_TITLES.editClass);
    });

    test('should show confirmation dialog when deleting', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.deleteClass(0);
      await expect(coordinatorPage.confirmDialogContent).toBeVisible();
    });
  });

  test.describe('Filters', () => {
    test('should display filter dropdown options', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.periodoFilter.click();
      const options = page.locator('.p-select-list li');
      const optionsCount = await options.count();
      expect(optionsCount).toBeGreaterThan(0);
    });
  });
});
