import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutCompletePage } from './CheckoutCompletePage';

export class CheckoutOverviewPage extends BasePage {
  readonly pageTitle: Locator;
  readonly backpackItem: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByText('Checkout: Overview');
    this.backpackItem = page.getByText('Sauce Labs Backpack');
    this.finishButton = page.getByTestId('finish');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout-step-two.html');
  }

  async finish(): Promise<CheckoutCompletePage> {
    await this.finishButton.click();
    return new CheckoutCompletePage(this.page);
  }
}
