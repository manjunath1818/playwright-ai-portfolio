import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly productCards: Locator;
  readonly productPrices: Locator;
  readonly productSortSelect: Locator;
  readonly backpackAddButton: Locator;
  readonly cartLink: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByText('Products');
    this.productCards = page.getByTestId('inventory-item');
    this.productPrices = page.getByTestId('inventory-item-price');
    this.productSortSelect = page.getByTestId('product-sort-container');
    this.backpackAddButton = page.getByTestId('add-to-cart-sauce-labs-backpack');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async addBackpackToCart(): Promise<void> {
    await this.backpackAddButton.click();
  }

  async sortByPriceLowToHigh(): Promise<void> {
    await this.productSortSelect.selectOption('lohi');
  }

  async openCart(): Promise<CartPage> {
    await this.cartLink.click();
    return new CartPage(this.page);
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
