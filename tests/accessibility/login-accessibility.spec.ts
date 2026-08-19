import { test, expect } from '../../src/fixtures/base';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('SauceDemo login accessibility', () => {
  test('keyboard users can reach all login controls @regression @a11y', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.focusUsername();
    await expect(loginPage.usernameField).toBeFocused();

    await loginPage.moveFocusToPassword();
    await expect(loginPage.passwordField).toBeFocused();

    await loginPage.moveFocusToLoginButton();
    await expect(loginPage.loginButton).toBeFocused();
  });
});
