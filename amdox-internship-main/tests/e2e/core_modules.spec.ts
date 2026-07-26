import { test, expect } from '@playwright/test';

const credentials = { email: 'admin@nexaops.com', password: 'Demo@2026!' };

async function login(page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  await page.click('#login-btn');
  await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
  await expect(page).toHaveURL(/.*dashboard/);
}

test('HR Directory & Payroll Process', async ({ page }) => {
  await login(page);
  await page.goto('http://localhost:3000/hr', { waitUntil: 'load', timeout: 30000 });
  await expect(page.locator('h2')).toContainText('Employee Directory', { timeout: 10000 });
  
  // Verify employee list rendering
  const table = page.locator('table');
  await expect(table).toBeVisible({ timeout: 10000 });

  // Navigate to Payroll
  await page.goto('http://localhost:3000/payroll', { waitUntil: 'load', timeout: 30000 });
  await expect(page.locator('h2')).toContainText('Payroll Engine', { timeout: 10000 });
  
  // Verify successful run banner (mocked as completed in page logic)
  await expect(page.locator('text=Processed Successfully')).toBeVisible({ timeout: 10000 });
});

test('Finance Ledger & Audit Verification', async ({ page }) => {
  await login(page);
  await page.goto('http://localhost:3000/finance', { waitUntil: 'load', timeout: 30000 });
  await expect(page.locator('h2')).toContainText('Financial Ledger', { timeout: 10000 });
  
  // Verify ledger data hydrate
  await expect(page.locator('text=Revenue').first()).toBeVisible({ timeout: 10000 });

  // Navigate to Audit
  await page.goto('http://localhost:3000/audit', { waitUntil: 'load', timeout: 30000 });
  await expect(page.locator('h2')).toContainText('Enterprise Audit Trail', { timeout: 10000 });
  
  // Verify Audit Log rendering and chain verification UI
  await expect(page.locator('text=Verification status')).toBeVisible({ timeout: 10000 });
  const verifyBtn = page.locator('button:has-text("Verify Chain")');
  await expect(verifyBtn).toBeVisible({ timeout: 10000 });
});
