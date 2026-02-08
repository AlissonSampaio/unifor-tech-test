import { Locator, Page, expect } from '@playwright/test';
import { DIALOG_TITLES, MESSAGES, ROUTES, TIMEOUTS } from '../fixtures/test-data';

export class CoordinatorPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly newClassButton: Locator;
  readonly classTable: Locator;
  readonly dialogContent: Locator;
  readonly dialogTitle: Locator;
  readonly saveButton: Locator;
  readonly saveButtonInternal: Locator;
  readonly cancelButton: Locator;
  readonly disciplinaSelect: Locator;
  readonly professorSelect: Locator;
  readonly horarioSelect: Locator;
  readonly maxAlunosInput: Locator;
  readonly cursosMultiSelect: Locator;
  readonly periodoFilter: Locator;
  readonly cursoFilter: Locator;
  readonly vagasMinFilter: Locator;
  readonly vagasMaxFilter: Locator;
  readonly editButtons: Locator;
  readonly deleteButtons: Locator;
  readonly confirmDialogContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-testid="page-title"]');
    this.newClassButton = page.locator('[data-testid="new-class-button"]');
    this.classTable = page.locator('[data-testid="class-table"]');
    this.dialogContent = page.locator('.p-dialog-content');
    this.dialogTitle = page.locator('.p-dialog-title');
    this.saveButton = page.locator('[data-testid="save-button"]');
    this.saveButtonInternal = page.locator('[data-testid="save-button"] button');
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
    this.disciplinaSelect = page.locator('p-select[formcontrolname="disciplinaId"]');
    this.professorSelect = page.locator('p-select[formcontrolname="professorId"]');
    this.horarioSelect = page.locator('p-select[formcontrolname="horarioId"]');
    this.maxAlunosInput = page.locator('p-inputnumber[formcontrolname="maxAlunos"] input');
    this.cursosMultiSelect = page.locator('p-multiselect[formcontrolname="cursosAutorizadosIds"]');
    this.periodoFilter = page.locator('p-select[formcontrolname="periodo"]');
    this.cursoFilter = page.locator('p-select[formcontrolname="cursoId"]');
    this.vagasMinFilter = page.locator('p-inputnumber[formcontrolname="maxAlunosMin"]');
    this.vagasMaxFilter = page.locator('p-inputnumber[formcontrolname="maxAlunosMax"]');
    this.editButtons = this.classTable.locator('p-button[icon="pi pi-pencil"]');
    this.deleteButtons = this.classTable.locator('p-button[icon="pi pi-trash"]');
    this.confirmDialogContent = page.locator('.p-confirmdialog');
  }

  async goto() {
    await this.page.goto(ROUTES.coordinator);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.pageTitle.waitFor({ state: 'visible', timeout: TIMEOUTS.navigation });
    await this.classTable.waitFor({ state: 'visible', timeout: TIMEOUTS.assertion });
  }

  async assertPageDisplayed() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.newClassButton).toBeVisible();
    await expect(this.classTable).toBeVisible();
  }

  async openNewClassDialog() {
    await this.newClassButton.click();
    await this.waitForDialogOpen();
  }

  async waitForDialogOpen() {
    await expect(this.dialogContent).toBeVisible({ timeout: TIMEOUTS.assertion });
  }

  async waitForDialogClose() {
    await expect(this.dialogContent).not.toBeVisible({ timeout: TIMEOUTS.assertion });
  }

  async closeDialog() {
    await this.cancelButton.click();
    await this.waitForDialogClose();
  }

  async assertDialogOpen(title: string = DIALOG_TITLES.newClass) {
    await expect(this.dialogContent).toBeVisible();
    await expect(this.dialogTitle).toContainText(title);
  }

  async isSaveButtonDisabled(): Promise<boolean> {
    return await this.saveButtonInternal.isDisabled();
  }

  async fillClassForm(data: {
    disciplina?: string;
    professor?: string;
    horario?: string;
    maxAlunos?: number;
    cursos?: string[];
  }) {
    if (data.disciplina) {
      await this.disciplinaSelect.click();
      await this.page.locator('.p-select-list li', { hasText: data.disciplina }).click();
    }
    if (data.professor) {
      await this.professorSelect.click();
      await this.page.locator('.p-select-list li', { hasText: data.professor }).click();
    }
    if (data.horario) {
      await this.horarioSelect.click();
      await this.page.locator('.p-select-list li', { hasText: data.horario }).click();
    }
    if (data.maxAlunos) {
      await this.maxAlunosInput.fill(data.maxAlunos.toString());
    }
    if (data.cursos && data.cursos.length > 0) {
      await this.cursosMultiSelect.click();
      for (const curso of data.cursos) {
        await this.page.locator('.p-multiselect-option', { hasText: curso }).click();
      }
      await this.page.keyboard.press('Escape');
    }
  }

  async submitForm() {
    await this.page.keyboard.press('Escape');
    await this.page.locator('.p-overlay').first().waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
    await this.saveButton.click();
  }

  async editClass(index = 0) {
    await this.editButtons.nth(index).click();
    await this.waitForDialogOpen();
  }

  async deleteClass(index = 0) {
    await this.deleteButtons.nth(index).click();
    await this.waitForConfirmDialogOpen();
  }

  async waitForConfirmDialogOpen() {
    await expect(this.confirmDialogContent).toBeVisible({ timeout: TIMEOUTS.assertion });
  }

  async confirmDelete() {
    await this.page.locator('.p-confirmdialog button', { hasText: /sim|yes|confirmar/i }).click();
  }

  async cancelDelete() {
    await this.page.locator('.p-confirmdialog button', { hasText: /não|no|cancelar/i }).click();
  }

  async getTableRowCount(): Promise<number> {
    const rows = this.page.locator('p-table tbody tr');
    return await rows.count();
  }

  async assertTableHasData() {
    const count = await this.getTableRowCount();
    expect(count).toBeGreaterThan(0);
  }

  async assertTableEmpty() {
    await expect(this.page.locator('td', { hasText: MESSAGES.emptyClassList })).toBeVisible();
  }

  async filterByPeriod(period: string) {
    await this.periodoFilter.click();
    await this.page.locator('.p-select-list li', { hasText: period }).click();
  }
}
