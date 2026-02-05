import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.po';
import { CoordinatorPage } from '../pages/coordinator.po';
import { StudentPage } from '../pages/student.po';

export const test = base.extend<{
  loginPage: LoginPage;
  coordinatorPage: CoordinatorPage;
  studentPage: StudentPage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  coordinatorPage: async ({ page }, use) => {
    const coordinatorPage = new CoordinatorPage(page);
    await use(coordinatorPage);
  },
  studentPage: async ({ page }, use) => {
    const studentPage = new StudentPage(page);
    await use(studentPage);
  },
});

export { expect } from '@playwright/test';
