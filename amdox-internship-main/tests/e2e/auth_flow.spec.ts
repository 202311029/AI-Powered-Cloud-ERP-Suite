import { test, expect } from '@playwright/test';

test('ERP Mission-Critical Authentication Flow', async ({ page }) => {
  // 1. Visit Login Page
  await page.goto('http://localhost:3000/login');
  
  // 2. Verify Keycloak SSO Bridge Engagement
  await expect(page).toHaveTitle(/Amdox ERP/);
  
  // 3. Mock Login Action
  await page.fill('input[type="email"]', 'admin@nexaops.com');
  await page.fill('input[type="password"]', 'Demo@2026!');
  await page.click('button#login-btn');
  await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });

  // 4. Verify Dashboard Onboarding & State Hydration
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  await expect(page.locator('h2')).toContainText('Executive Summary', { timeout: 10000 });
  
  // 5. Verify Real-time Connectivity Badge
  const connectivity = page.locator('text=Connected');
  await expect(connectivity).toBeVisible({ timeout: 10000 });
});
