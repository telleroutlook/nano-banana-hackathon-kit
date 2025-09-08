import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localUrl = 'file://' + path.resolve(__dirname, '../public/index.html');

test('index loads and shows expected elements', async ({ page }) => {
  await page.goto(localUrl);
  await expect(page.locator('h1')).toHaveText('ChronoSnap – Time-Travel Selfie Booth');
  await expect(page.locator('#photo')).toBeVisible();
  await expect(page.locator('#scenarios')).toBeVisible();
  await expect(page.locator('#scenarios option')).toHaveCount(3);
  await expect(page.locator('#generate')).toBeVisible();
});
