import { test, expect } from '@playwright/test';
import { generatePassword } from '../src/utils/passwordGenerator';

// ==========================================
// 1. Unit Testing (Модульне)
// ==========================================
test('Unit Test: Генератор паролів створює рядок правильної довжини', () => {
    const password = generatePassword();
    expect(typeof password).toBe('string');
    expect(password.length).toBeGreaterThan(5);
});

// ==========================================
// 2. Integration Testing (Інтеграційне)
// ==========================================
test('Integration Test: API реєстрації відповідає на запит', async ({ request }) => {
    const response = await request.post('http://localhost:5122/api/Auth/register', {
        data: {
            username: 'playwrightTest',
            email: 'playwright@test.com',
            nickname: 'PlayTest',
            password: 'StrongPass123!',
            avatarUrl: ''
        }
    });
    expect(response.status() === 200 || response.status() === 400).toBeTruthy();
});

// ==========================================
// 3. End-to-End Testing (E2E)
// ==========================================
test('E2E Test: Юзер заповнює форму реєстрації', async ({ page }) => {
    await page.goto('http://localhost:5173/register');

    await expect(page.locator('h2')).toContainText('Приєднатися до FanWiki');

    await page.getByPlaceholder('Логін (Username)').fill('playwright_user');
    await page.getByPlaceholder('Email').fill('user@test.com');

    await page.getByTitle('Згенерувати пароль').click();

    await page.screenshot({ path: 'e2e-form-filled.png' });

    await page.getByRole('button', { name: 'Створити акаунт' }).click();
});