import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home.page';

test.describe('Example.com smoke tests', () => {
  test('loads the homepage and checks title', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(page).toHaveTitle(/Example Domain/);
    await expect(home.heading).toHaveText('Example Domain');
  });
});
