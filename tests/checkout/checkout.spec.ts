import { test, expect } from '../../src/fixtures/base';
import checkoutData from '../data/checkout.json' with { type: 'json' };

test.describe('SauceDemo checkout', () => {
  test('standard user completes a backpack purchase @smoke @critical', async ({ inventoryPage }) => {
    await test.step('add the backpack and open the cart', async () => {
      await inventoryPage.addBackpackToCart();
    });
    const cartPage = await inventoryPage.openCart();
    await expect(cartPage.backpackItem).toBeVisible();

    const checkoutInformationPage = await cartPage.checkout();
    const checkoutOverviewPage = await checkoutInformationPage.continueWith(checkoutData.standardCustomer);
    await expect(checkoutOverviewPage.backpackItem).toBeVisible();

    const checkoutCompletePage = await checkoutOverviewPage.finish();
    await expect(checkoutCompletePage.confirmationHeading).toBeVisible();
  });

  test('standard user can remove a product before checkout @regression', async ({ inventoryPage }) => {
    await inventoryPage.addBackpackToCart();
    const cartPage = await inventoryPage.openCart();
    await cartPage.removeBackpack();

    await expect(cartPage.backpackItem).toHaveCount(0);
  });

  test('checkout requires customer details @regression', async ({ inventoryPage }) => {
    await inventoryPage.addBackpackToCart();
    const cartPage = await inventoryPage.openCart();
    const checkoutInformationPage = await cartPage.checkout();
    await checkoutInformationPage.continueWithoutDetails();

    await expect(checkoutInformationPage.errorBanner).toContainText('First Name is required');
  });
});
