import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { FairSplitPage } from '../ui_pages/FairSplit';

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  const content = readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^(\w+)(?:\s*[:=]\s*)(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  }
  return env;
}

function getRequiredEnv(name: string): string {
  if (process.env[name]) {
    return process.env[name] as string;
  }

  const env = loadEnvFile();
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const fairsplitUrl = getRequiredEnv('fairsplitUrl');
const phoneNumber = getRequiredEnv('phoneNumber');
const passWord = getRequiredEnv('passWord');

test.setTimeout(180000);

// Wait 10 seconds after each test finishes (useful for debugging/observing)
test.afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 10000));
});

test.describe('Fair Split UI test', () => {
  test('should log in to FairSplit using configured credentials', async ({ page }) => {
    const fairSplitPage = new FairSplitPage(page);

    await fairSplitPage.goto(fairsplitUrl);
    await fairSplitPage.login(phoneNumber, passWord);

    await expect(page).toHaveURL(/\/chat$/);
    
  });

  test('should chat and select options in FairSplit for a specific domain', async ({ page }) => {
    const fairSplitPage = new FairSplitPage(page);

    // Screenshot 1: just after login
    await fairSplitPage.goto(fairsplitUrl);
    await fairSplitPage.login(phoneNumber, passWord);
    console.log('1: Just after login - logged in successfully');
    await page.waitForTimeout(2000);

    // Screenshot 2: enter Domain Specialization message and hit enter
    console.log('2: Entering "Domain Specialization: Indian Family Law" in chat');
    await fairSplitPage.enterChat('Domain Specialization: Indian Family Law');
    await fairSplitPage.waitForOptionsOrAnswer();
    await page.waitForTimeout(2000);

    // Screenshot 3: after selecting 1st option
    console.log('3: Selecting first option');
    const opts1 = await fairSplitPage.optionButtons.count();
    if (opts1 > 0) {
      await fairSplitPage.selectOption(1);
      await fairSplitPage.waitForOptionsOrAnswer();
    }
    await page.waitForTimeout(2000);

    // Screenshot 4: after selecting option 1 (second time)
    console.log('4: Selecting first option again');
    const opts2 = await fairSplitPage.optionButtons.count();
    if (opts2 > 0) {
      await fairSplitPage.selectOption(1);
      await fairSplitPage.waitForOptionsOrAnswer();
    }
    await page.waitForTimeout(2000);

    // Log the highlighted text from the final answer
    const highlightedText = await fairSplitPage.getHighlightedText();
    console.log('Highlighted text from answer:', highlightedText);
    expect(highlightedText).not.toBe('');

    // Screenshot 5: delete all chats via API and wait 10 seconds before logout
    console.log('5: Deleting all chats via API');
    const apiRes = await fairSplitPage.deleteAllChatsViaApi();
    console.log('API delete result:', apiRes);
    expect(apiRes.ok).toBe(true);
    expect(apiRes.remaining).toEqual([]);
    console.log('Chats cleared, waiting 10 seconds before logout');
    await page.waitForTimeout(10000);
  });

  test('should answer property division in divorce question in FairSplit', async ({ page }) => {
    const fairSplitPage = new FairSplitPage(page);

    // Screenshot 1: just after login
    await fairSplitPage.goto(fairsplitUrl);
    await fairSplitPage.login(phoneNumber, passWord);
    console.log('1: Just after login - logged in successfully');
    await page.waitForTimeout(2000);

    // Screenshot 2: enter property division question and hit enter
    console.log('2: Entering "How is property divided in a divorce?" in chat');
    await fairSplitPage.enterChat('How is property divided in a divorce?');
    await fairSplitPage.waitForOptionsOrAnswer();
    await page.waitForTimeout(2000);

    // Screenshot 3: after selecting 1st option (if available)
    console.log('3: Selecting first option if available');
    const opts1 = await fairSplitPage.optionButtons.count();
    if (opts1 > 0) {
      await fairSplitPage.selectOption(1);
      await fairSplitPage.waitForOptionsOrAnswer();
    }
    await page.waitForTimeout(2000);

    // Log the highlighted text from the final answer
    const highlightedText = await fairSplitPage.getHighlightedText();
    console.log('Highlighted text from answer:', highlightedText);
    expect(highlightedText).not.toBe('');

    // Screenshot 4: delete all chats via API and wait 10 seconds before logout
    console.log('4: Deleting all chats via API');
    const apiRes = await fairSplitPage.deleteAllChatsViaApi();
    console.log('API delete result:', apiRes);
    expect(apiRes.ok).toBe(true);
    expect(apiRes.remaining).toEqual([]);
    console.log('Chats cleared, waiting 10 seconds before logout');
    await page.waitForTimeout(10000);
  });
});
