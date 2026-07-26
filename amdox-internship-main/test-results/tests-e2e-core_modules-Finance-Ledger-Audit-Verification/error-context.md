# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\core_modules.spec.ts >> Finance Ledger & Audit Verification
- Location: tests\e2e\core_modules.spec.ts:31:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Revenue').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Revenue').first()
    - waiting for" http://localhost:3000/login" navigation to finish...
    - navigated to "http://localhost:3000/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: A
      - heading "Amdox ERP" [level=1] [ref=e6]
      - paragraph [ref=e7]: Sign in to your workspace
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: EMAIL
          - textbox [ref=e12]: admin@nexaops.com
        - generic [ref=e13]:
          - generic [ref=e14]: PASSWORD
          - textbox [ref=e15]: Demo@2026!
        - button "Sign in →" [ref=e16] [cursor=pointer]
      - generic [ref=e17]:
        - strong [ref=e18]: Demo credentials pre-filled
        - text: admin@nexaops.com / Demo@2026!
  - alert [ref=e19]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const credentials = { email: 'admin@nexaops.com', password: 'Demo@2026!' };
  4  | 
  5  | async function login(page) {
  6  |   await page.goto('http://localhost:3000/login');
  7  |   await page.fill('input[type="email"]', credentials.email);
  8  |   await page.fill('input[type="password"]', credentials.password);
  9  |   await page.click('#login-btn');
  10 |   await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
  11 |   await expect(page).toHaveURL(/.*dashboard/);
  12 | }
  13 | 
  14 | test('HR Directory & Payroll Process', async ({ page }) => {
  15 |   await login(page);
  16 |   await page.goto('http://localhost:3000/hr', { waitUntil: 'load', timeout: 30000 });
  17 |   await expect(page.locator('h2')).toContainText('Employee Directory', { timeout: 10000 });
  18 |   
  19 |   // Verify employee list rendering
  20 |   const table = page.locator('table');
  21 |   await expect(table).toBeVisible({ timeout: 10000 });
  22 | 
  23 |   // Navigate to Payroll
  24 |   await page.goto('http://localhost:3000/payroll', { waitUntil: 'load', timeout: 30000 });
  25 |   await expect(page.locator('h2')).toContainText('Payroll Engine', { timeout: 10000 });
  26 |   
  27 |   // Verify successful run banner (mocked as completed in page logic)
  28 |   await expect(page.locator('text=Processed Successfully')).toBeVisible({ timeout: 10000 });
  29 | });
  30 | 
  31 | test('Finance Ledger & Audit Verification', async ({ page }) => {
  32 |   await login(page);
  33 |   await page.goto('http://localhost:3000/finance', { waitUntil: 'load', timeout: 30000 });
  34 |   await expect(page.locator('h2')).toContainText('Financial Ledger', { timeout: 10000 });
  35 |   
  36 |   // Verify ledger data hydrate
> 37 |   await expect(page.locator('text=Revenue').first()).toBeVisible({ timeout: 10000 });
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  38 | 
  39 |   // Navigate to Audit
  40 |   await page.goto('http://localhost:3000/audit', { waitUntil: 'load', timeout: 30000 });
  41 |   await expect(page.locator('h2')).toContainText('Enterprise Audit Trail', { timeout: 10000 });
  42 |   
  43 |   // Verify Audit Log rendering and chain verification UI
  44 |   await expect(page.locator('text=Verification status')).toBeVisible({ timeout: 10000 });
  45 |   const verifyBtn = page.locator('button:has-text("Verify Chain")');
  46 |   await expect(verifyBtn).toBeVisible({ timeout: 10000 });
  47 | });
  48 | 
```