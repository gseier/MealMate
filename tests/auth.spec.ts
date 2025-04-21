import { test, expect } from '@playwright/test';

const testEmail = `testuserfunnyguy14@example.com`;
const testUsername = `testuserfunnyguy14`;
const testPassword = 'Test1234!';

test.describe.serial('AUTH', () => {
  test('signup works', async ({ page }) => {
    await test.step('Go to signup page', async () => {
      await page.goto('http://localhost:3001/signup');
    });

    await test.step('Fill signup form', async () => {
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="username"]', testUsername);
      await page.fill('input[name="password"]', testPassword);
    });

    await test.step('Submit signup form', async () => {
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/localhost:3001\/?/);
    });

    await test.step('Open user menu and log out', async () => {
      await page.getByTestId('user-avatar-button').click();
      await expect(page.locator('text=Logout')).toBeVisible();
      await page.locator('text=Logout').click();
    });
  });

  test('login works', async ({ page }) => {
    await test.step('Go to login page', async () => {
      await page.goto('http://localhost:3001/login');
    });

    await test.step('Fill login form', async () => {
      await page.fill('input[name="username"]', testUsername);
      await page.fill('input[name="password"]', testPassword);
    });

    await test.step('Submit login form', async () => {
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/localhost:3001\/?/);
    });

    await test.step('Open user menu after login', async () => {
      await page.getByTestId('user-avatar-button').click();
      await expect(page.locator('text=Logout')).toBeVisible();
    });
  });
});
