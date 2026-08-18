import { test, expect } from '../../src/fixtures/base';
import { LoginPage } from '../../src/pages/LoginPage';
import users from '../data/users.json' with { type: 'json' };

test.describe('SauceDemo login', () => {
  test('standard user reaches inventory @smoke @critical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const inventoryPage = await loginPage.loginAs(users.standard);

    await expect(inventoryPage.pageTitle).toBeVisible();
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('locked user receives a clear error @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(users.locked);

    await expect(loginPage.errorBanner).toContainText('Sorry, this user has been locked out.');
  });

  test('missing username is rejected @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithPasswordOnly(users.standard.password);

    await expect(loginPage.errorBanner).toContainText('Username is required');
  });

  test('missing password is rejected @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithUsernameOnly(users.standard.username);

    await expect(loginPage.errorBanner).toContainText('Password is required');
  });

  test('invalid user is rejected @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs(users.invalid);

    await expect(loginPage.errorBanner).toContainText('Username and password do not match any user in this service');
  });
});
