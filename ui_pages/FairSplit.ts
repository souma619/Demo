import { Locator, Page } from '@playwright/test';

const defaultLoginUrl = 'https://fairsplit.in/login';

export class FairSplitPage {
  readonly page: Page;
  readonly mainHeading: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly chatInput: Locator;
  readonly optionButtons: Locator;
  readonly answerMessages: Locator;

  private readonly optionButtonSelector = '[class*="StarterChips_starterChip"]';
  private readonly answerMessageSelector = 'div[class*="MessageList_aiMessageWrapper"], div[class*="MessageList_aiMessage"]';

  constructor(page: Page) {
    this.page = page;
    this.mainHeading = page.locator('h1');
    this.phoneInput = page.locator('input[name="identifier"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button:has-text("Login")');
    this.chatInput = page.locator('textarea');
    this.optionButtons = page.locator(this.optionButtonSelector);
    this.answerMessages = page.locator(this.answerMessageSelector);
  }

  async goto(url?: string) {
    const targetUrl = url || defaultLoginUrl;
    await this.page.goto(targetUrl, { waitUntil: 'networkidle' });
  }

  async login(phoneNumber: string, passWord: string) {
    if (!phoneNumber || !passWord) {
      throw new Error('Both phoneNumber and passWord must be provided for FairSplit login');
    }

    await this.phoneInput.fill(phoneNumber);
    await this.passwordInput.fill(passWord);
    await this.loginButton.click();
    await this.waitForChatPage();
  }

  async waitForChatPage() {
    await this.page.waitForURL('**/chat', { timeout: 15000 });
  }

  async enterChat(message: string) {
    await this.chatInput.fill(message);
    await this.chatInput.press('Enter');
  }

  async waitForOptions(timeout = 15000) {
    await this.optionButtons.first().waitFor({ state: 'visible', timeout });
    return this.optionButtons;
  }

  async selectOption(index = 1) {
    const count = await this.optionButtons.count();
    if (count < index) {
      throw new Error(`Expected at least ${index} chat options, but found ${count}`);
    }
    await this.optionButtons.nth(index - 1).click();
  }

  async waitForOptionsOrAnswer(timeout = 15000) {
    await Promise.race([
      this.page.waitForSelector(this.optionButtonSelector, { state: 'visible', timeout }),
      this.page.waitForSelector(this.answerMessageSelector, { state: 'visible', timeout })
    ]);
  }

  async getLatestAnswer() {
    const answerSelector = 'div[class*="MessageList_aiMessageWrapper"], div[class*="MessageList_aiMessage"]';
    const answers = await this.page.locator(answerSelector).all();
    const count = answers.length;
    if (count === 0) {
      return '';
    }
    return (await this.page.locator(answerSelector).nth(count - 1).textContent())?.trim() ?? '';
  }

  getMainHeading() {
    return this.mainHeading;
  }
}
