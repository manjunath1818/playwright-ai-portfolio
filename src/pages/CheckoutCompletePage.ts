import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly confirmationHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your order!' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout-complete.html');
  }
}
