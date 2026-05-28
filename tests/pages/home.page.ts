import type { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly moreInfoLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.moreInfoLink = page.locator('a');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickMoreInfo() {
    await this.moreInfoLink.click();
  }
}
