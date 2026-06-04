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

test.describe('Fair Split UI test', () => {
  test('should log in to FairSplit using configured credentials', async ({ page }) => {
    const fairSplitPage = new FairSplitPage(page);

    await fairSplitPage.goto(fairsplitUrl);
    await fairSplitPage.login(phoneNumber, passWord);

    await expect(page).toHaveURL(/\/chat$/);
  });

  test('should chat and select options in FairSplit', async ({ page }) => {
    const fairSplitPage = new FairSplitPage(page);

    await fairSplitPage.goto(fairsplitUrl);
    await fairSplitPage.login(phoneNumber, passWord);

    await fairSplitPage.enterChat('Domain Specialization: Indian Family Law');
    await fairSplitPage.waitForOptions();
    await fairSplitPage.selectOption(1);

    await fairSplitPage.waitForOptions();
    await fairSplitPage.selectOption(1);

    await fairSplitPage.waitForOptionsOrAnswer();
    const finalMessage = await fairSplitPage.getLatestAnswer();

    console.log('Final chat response:', finalMessage);
    expect(finalMessage).not.toBe('');
  });
});
