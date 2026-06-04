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
  private readonly answerMessageSelector = 'div[class*="MessageList_aiMessageWrapper"], div[class*="MessageList_aiMessage"], div[class*="MessageList_markdownContent"], div[class*="MessageList_messageBubble"], div[class*="MessageList_messageContentWrapper"]';

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

  async clickAndWait(locator: Locator) {
    await locator.click();
    await this.page.waitForTimeout(10000);
  }

  async login(phoneNumber: string, passWord: string) {
    if (!phoneNumber || !passWord) {
      throw new Error('Both phoneNumber and passWord must be provided for FairSplit login');
    }

    await this.phoneInput.fill(phoneNumber);
    await this.passwordInput.fill(passWord);
    await this.clickAndWait(this.loginButton);
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
    try {
      await this.page.waitForSelector(this.optionButtonSelector, { state: 'visible', timeout });
    } catch (e) {
      // no options appeared within timeout
      return this.optionButtons;
    }
    return this.optionButtons;
  }

  async selectOption(index = 1) {
    const count = await this.optionButtons.count();
    if (count < index) {
      return false;
    }
    await this.clickAndWait(this.optionButtons.nth(index - 1));
    return true;
  }

  async waitForOptionsOrAnswer(timeout = 15000) {
    await Promise.race([
      this.page.waitForSelector(this.optionButtonSelector, { state: 'visible', timeout }),
      this.page.waitForSelector(this.answerMessageSelector, { state: 'visible', timeout })
    ]);

  }

  async getHighlightedText() {
    // Get all AI message content and extract highlighted/main text
    const answerSelector = 'div[class*="MessageList_markdownContent"]';
    const answers = await this.page.locator(answerSelector).all();
    if (answers.length === 0) {
      return '';
    }
    // Return the last answer's text content
    return (await answers[answers.length - 1].textContent())?.trim() ?? '';
  }
  async deleteAllChatsViaApi() {
    const result = await this.page.evaluate(async () => {
      const base = window.location.origin;
      const getRes = await fetch(`${base}/api/chats/`, { credentials: 'same-origin' });
      if (!getRes.ok) {
        return { ok: false, status: getRes.status, body: await getRes.text() };
      }
      const chats = await getRes.json();
      if (!Array.isArray(chats)) {
        return { ok: false, status: 200, remaining: chats };
      }
      for (const c of chats) {
        try {
          await fetch(`${base}/api/chats/${c.chat_id}`, { method: 'DELETE', credentials: 'same-origin' });
        } catch (e) {
          // ignore individual delete errors and continue
        }
      }
      const after = await fetch(`${base}/api/chats/`, { credentials: 'same-origin' });
      const remaining = after.ok ? await after.json() : null;
      return { ok: true, remaining };
    });
    return result;
  }

  getMainHeading() {
    return this.mainHeading;
  }
}
