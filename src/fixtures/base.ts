import { test as base, expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  inventoryPage: InventoryPage;
};

export const test = base.extend<Fixtures>({
  inventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const inventoryPage = await loginPage.loginAs({
      username: process.env.E2E_USERNAME ?? 'standard_user',
      password: process.env.E2E_PASSWORD ?? 'secret_sauce',
    });
    await use(inventoryPage);
  },
});

export { expect };
