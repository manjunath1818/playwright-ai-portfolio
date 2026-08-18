import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutOverviewPage } from './CheckoutOverviewPage';

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

export class CheckoutInformationPage extends BasePage {
  readonly pageTitle: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly postalCodeField: Locator;
  readonly continueButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByText('Checkout: Your Information');
    this.firstNameField = page.getByTestId('firstName');
    this.lastNameField = page.getByTestId('lastName');
    this.postalCodeField = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.errorBanner = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout-step-one.html');
  }

  async continueWith(details: CustomerDetails): Promise<CheckoutOverviewPage> {
    await this.firstNameField.fill(details.firstName);
    await this.lastNameField.fill(details.lastName);
    await this.postalCodeField.fill(details.postalCode);
    await this.continueButton.click();
    return new CheckoutOverviewPage(this.page);
  }

  async continueWithoutDetails(): Promise<void> {
    await this.continueButton.click();
  }
}
