# Demo Playwright TypeScript Framework

This repository contains a starter Playwright framework using TypeScript.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Open the HTML report:
   ```bash
   npm run test:report
   ```

## Structure

- `playwright.config.ts` — Playwright configuration for Chromium, Firefox, and WebKit.
- `tests/` — Example tests.
- `tests/pages/` — Page Object Model example.
- `tsconfig.json` — TypeScript configuration.
- `.gitignore` — Common ignored files for Playwright projects.

## Notes

- The sample test navigates to `https://example.com`.
- Customize `baseURL` and add new page objects as needed.
