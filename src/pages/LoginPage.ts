import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { InventoryPage } from './InventoryPage';

export class LoginPage extends BasePage {
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField = page.getByRole('textbox', { name: 'Username' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorBanner = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async loginAs(credentials: { username: string; password: string }): Promise<InventoryPage> {
    await this.usernameField.fill(credentials.username);
    await this.passwordField.fill(credentials.password);
    await this.loginButton.click();
    return new InventoryPage(this.page);
  }

  async loginWithUsernameOnly(username: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.loginButton.click();
  }

  async loginWithPasswordOnly(password: string): Promise<void> {
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  async submitEmptyCredentials(): Promise<void> {
    await this.loginButton.click();
  }

  async focusUsername(): Promise<void> {
    await this.usernameField.focus();
  }

  async moveFocusToPassword(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }

  async moveFocusToLoginButton(): Promise<void> {
    await this.page.keyboard.press('Tab');
  }
}
