import { expect, test } from '@playwright/test';
import {
  API_ROUTES,
  MOCK_MATRIZ_CURRICULAR,
  MOCK_DISCIPLINAS,
  MOCK_PROFESSORES,
  MOCK_HORARIOS,
  MOCK_CURSOS,
  MOCK_NEW_MATRIZ,
} from './fixtures/mock-data';
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
    test('should open new class dialog when clicking "Nova Aula"', async ({ page }) => {
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

    test('save button should be disabled when form is invalid', async ({ page }) => {
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
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      );
    });

    test('should display empty message when no classes exist', async ({ page }) => {
      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.assertTableEmpty();
    });
  });

  test.describe('Populated Table State', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(API_ROUTES.matriz, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MATRIZ_CURRICULAR) })
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

    test('should open edit dialog with "Editar Aula" title', async ({ page }) => {
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

  test.describe('Complete CRUD Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(API_ROUTES.disciplinas, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DISCIPLINAS) })
      );
      await page.route(API_ROUTES.professores, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFESSORES) })
      );
      await page.route(API_ROUTES.horarios, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_HORARIOS) })
      );
      await page.route(API_ROUTES.cursos, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CURSOS) })
      );
    });

    test('should create a new class successfully', async ({ page }) => {
      let matrizData = [...MOCK_MATRIZ_CURRICULAR];

      await page.route(API_ROUTES.matriz, (route) => {
        if (route.request().method() === 'POST') {
          matrizData = [...matrizData, MOCK_NEW_MATRIZ];
          return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(MOCK_NEW_MATRIZ) });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(matrizData) });
      });

      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      const initialCount = await coordinatorPage.getTableRowCount();

      await coordinatorPage.openNewClassDialog();
      await coordinatorPage.fillClassForm({
        disciplina: MOCK_DISCIPLINAS[2].nome,
        professor: MOCK_PROFESSORES[2].nome,
        horario: MOCK_HORARIOS[2].diaSemana,
        maxAlunos: 20,
        cursos: [MOCK_CURSOS[1].nome],
      });

      await expect(coordinatorPage.saveButtonInternal).toBeEnabled({ timeout: 5000 });

      await coordinatorPage.submitForm();
      await coordinatorPage.waitForDialogClose();

      const finalCount = await coordinatorPage.getTableRowCount();
      expect(finalCount).toBe(initialCount + 1);
    });

    test('should delete a class successfully', async ({ page }) => {
      let matrizData = [...MOCK_MATRIZ_CURRICULAR];

      await page.route(API_ROUTES.matriz, (route) => {
        if (route.request().method() === 'DELETE') {
          matrizData = matrizData.slice(1);
          return route.fulfill({ status: 204 });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(matrizData) });
      });

      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      const initialCount = await coordinatorPage.getTableRowCount();

      await coordinatorPage.deleteClass(0);
      await expect(coordinatorPage.confirmDialogContent).toBeVisible();

      await coordinatorPage.confirmDelete();

      await page.waitForTimeout(500);
      const finalCount = await coordinatorPage.getTableRowCount();
      expect(finalCount).toBe(initialCount - 1);
    });

    test('should cancel deletion when clicking cancel', async ({ page }) => {
      await page.route(API_ROUTES.matriz, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MATRIZ_CURRICULAR) })
      );

      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      const initialCount = await coordinatorPage.getTableRowCount();

      await coordinatorPage.deleteClass(0);
      await expect(coordinatorPage.confirmDialogContent).toBeVisible();

      await coordinatorPage.cancelDelete();
      await expect(coordinatorPage.confirmDialogContent).toBeHidden();

      const finalCount = await coordinatorPage.getTableRowCount();
      expect(finalCount).toBe(initialCount);
    });
  });

  test.describe('API Error Handling', () => {
    test('should handle server error when loading classes', async ({ page }) => {
      await page.route(API_ROUTES.matriz, (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) })
      );

      const coordinatorPage = new CoordinatorPage(page);
      await page.goto('/coordenador');

      await expect(coordinatorPage.classTable).toBeVisible();
    });

    test('should handle error when creating class', async ({ page }) => {
      await page.route(API_ROUTES.matriz, (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Horário já ocupado' }) });
        }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MATRIZ_CURRICULAR) });
      });
      await page.route(API_ROUTES.disciplinas, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DISCIPLINAS) })
      );
      await page.route(API_ROUTES.professores, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFESSORES) })
      );
      await page.route(API_ROUTES.horarios, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_HORARIOS) })
      );
      await page.route(API_ROUTES.cursos, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CURSOS) })
      );

      const coordinatorPage = new CoordinatorPage(page);
      await coordinatorPage.goto();

      await coordinatorPage.openNewClassDialog();
      await coordinatorPage.fillClassForm({
        disciplina: MOCK_DISCIPLINAS[0].nome,
        professor: MOCK_PROFESSORES[0].nome,
        horario: MOCK_HORARIOS[0].diaSemana,
        maxAlunos: 30,
        cursos: [MOCK_CURSOS[0].nome],
      });

      await coordinatorPage.submitForm();

      const toast = page.locator('.p-toast-message-error');
      await expect(toast).toBeVisible({ timeout: 5000 });
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
