import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutInformationPage } from './CheckoutInformationPage';

export class CartPage extends BasePage {
  readonly pageTitle: Locator;
  readonly backpackItem: Locator;
  readonly backpackRemoveButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByText('Your Cart');
    this.backpackItem = page.getByText('Sauce Labs Backpack');
    this.backpackRemoveButton = page.getByTestId('remove-sauce-labs-backpack');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  async checkout(): Promise<CheckoutInformationPage> {
    await this.checkoutButton.click();
    return new CheckoutInformationPage(this.page);
  }

  async removeBackpack(): Promise<void> {
    await this.backpackRemoveButton.click();
  }
}
