import { test, expect } from '@playwright/test';

test.describe('簇点链路', () => {
  const APP_NAME = 'sentinel-token-server';

  const getInstanceSelect = (page: import('@playwright/test').Page) => page.getByRole('combobox').first();
  const getSearchInput = (page: import('@playwright/test').Page) => page.getByPlaceholder(/搜索资源名/);
  const getResourceTable = (page: import('@playwright/test').Page) => page.locator('table').first();

  async function gotoIdentityPage(page: import('@playwright/test').Page) {
    await page.goto(`/dashboard/apps/${APP_NAME}/identity`);
    await page.waitForLoadState('networkidle');
  }

  async function expectIdentityLoaded(page: import('@playwright/test').Page) {
    await expect(page.getByRole('heading', { name: APP_NAME })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('簇点链路').first()).toBeVisible({ timeout: 10000 });
    await expect(getInstanceSelect(page)).toBeVisible({ timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await gotoIdentityPage(page);
    await expectIdentityLoaded(page);
  });

  test('加载簇点链路页面并自动选择实例', async ({ page }) => {
    const instanceSelect = getInstanceSelect(page);
    const optionCount = await instanceSelect.locator('option').count();

    if (optionCount > 0) {
      await expect.poll(async () => instanceSelect.inputValue(), { timeout: 10000 }).not.toBe('');
      await expect(page.getByText('请先选择一台实例')).toHaveCount(0);
      await expect(getResourceTable(page)).toBeVisible({ timeout: 10000 });
    } else {
      await expect(instanceSelect).toBeDisabled();
      await expect(page.getByText('请先选择一台实例')).toBeVisible({ timeout: 10000 });
    }
  });

  test('支持列表视图与树状视图切换', async ({ page }) => {
    const listButton = page.getByRole('button', { name: '列表视图' });
    const treeButton = page.getByRole('button', { name: '树状视图' });
    const table = getResourceTable(page);

    await expect(listButton).toBeVisible();
    await expect(treeButton).toBeVisible();
    await expect(table).toBeVisible({ timeout: 10000 });

    await treeButton.click();
    await page.waitForTimeout(300);
    await expect(getResourceTable(page)).toBeVisible({ timeout: 10000 });

    await listButton.click();
    await page.waitForTimeout(300);
    await expect(getResourceTable(page)).toBeVisible({ timeout: 10000 });
  });

  test('搜索资源后可过滤并在清空后恢复', async ({ page }) => {
    const instanceSelect = getInstanceSelect(page);
    const optionCount = await instanceSelect.locator('option').count();
    test.skip(optionCount === 0, '当前环境没有可用实例，无法验证资源搜索');

    await expect.poll(async () => instanceSelect.inputValue(), { timeout: 10000 }).not.toBe('');

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    test.skip(rowCount === 0, '当前实例没有资源数据，无法验证搜索过滤');

    const firstResourceCell = rows.first().locator('td').first();
    const rawText = (await firstResourceCell.textContent()) ?? '';
    const searchKeyword = rawText
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .pop();

    expect(searchKeyword).toBeTruthy();

    const searchInput = getSearchInput(page);
    await searchInput.fill(searchKeyword!);
    await page.waitForTimeout(400);

    await expect(rows.first().locator('td').first()).toContainText(searchKeyword!);

    await searchInput.clear();
    await page.waitForTimeout(400);
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test('多实例时允许切换实例，单实例时保持当前选择', async ({ page }) => {
    const instanceSelect = getInstanceSelect(page);
    const options = instanceSelect.locator('option');
    const optionCount = await options.count();
    test.skip(optionCount === 0, '当前环境没有可用实例');

    await expect.poll(async () => instanceSelect.inputValue(), { timeout: 10000 }).not.toBe('');

    if (optionCount === 1) {
      await expect(instanceSelect).toHaveValue(await options.first().getAttribute('value'));
      return;
    }

    const secondValue = await options.nth(1).getAttribute('value');
    expect(secondValue).toBeTruthy();

    await instanceSelect.selectOption(secondValue!);
    await expect(instanceSelect).toHaveValue(secondValue!);
    await expect(getResourceTable(page)).toBeVisible({ timeout: 10000 });
  });
});
