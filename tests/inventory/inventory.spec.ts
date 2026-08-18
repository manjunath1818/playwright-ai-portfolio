import { test, expect } from '../../src/fixtures/base';

test.describe('SauceDemo inventory', () => {
  test('standard user sees all six products @smoke @regression', async ({ inventoryPage }) => {
    await expect(inventoryPage.productCards).toHaveCount(6);
  });

  test('standard user can sort products by price @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortByPriceLowToHigh();

    await expect(inventoryPage.productPrices).toHaveText([
      '$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99',
    ]);
  });

  test('standard user can log out safely @regression', async ({ page, inventoryPage }) => {
    await inventoryPage.logout();

    await expect(page).toHaveURL(/saucedemo.com\/?$/);
  });
});
