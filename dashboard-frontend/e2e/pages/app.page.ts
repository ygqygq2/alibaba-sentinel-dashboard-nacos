import { Page, expect } from '@playwright/test';

/**
 * 应用页面对象
 * 用于操作应用列表和应用详情
 */
export class AppPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async expectAppsLoaded() {
    // 等待应用列表加载
    await expect(this.page.locator('[data-testid="app-list"], .app-list, table, [role="table"]').first()).toBeVisible({
      timeout: 15000,
    });
  }

  async waitForApp(appName: string, timeout = 30000) {
    // 等待特定应用出现在列表中
    await expect(this.page.locator(`text=${appName}`).first()).toBeVisible({ timeout });
  }

  async selectApp(appName: string) {
    await this.page.click(`text=${appName}`);
    await this.page.waitForLoadState('networkidle');
  }

  async getAppCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, [data-testid="app-item"]');
    return await rows.count();
  }

  async refreshApps() {
    const refreshBtn = this.page.locator('button:has-text("刷新"), button:has-text("Refresh"), [aria-label="刷新"]');
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}

/**
 * 规则页面基类
 */
export class RulePage {
  constructor(
    protected page: Page,
    protected ruleType: string
  ) {}

  async goto(appName: string) {
    await this.page.goto(`/dashboard/apps/${appName}/${this.ruleType}`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    await expect(this.page.locator('main, [data-testid="rule-list"], table').first()).toBeVisible({
      timeout: 10000,
    });
  }

  async clickAddRule() {
    await this.page.click('button:has-text("新增"), button:has-text("Add"), a:has-text("新增")');
    await this.page.waitForLoadState('networkidle');
  }

  async getRuleCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, [data-testid="rule-item"]');
    return await rows.count();
  }

  async deleteRule(index: number) {
    const deleteBtn = this.page
      .locator('table tbody tr, [data-testid="rule-item"]')
      .nth(index)
      .locator('button:has-text("删除"), button:has-text("Delete"), [aria-label="删除"]');
    await deleteBtn.click();

    // 确认删除
    const confirmBtn = this.page.locator(
      'button:has-text("确认"), button:has-text("Confirm"), [data-testid="confirm-delete"]'
    );
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
  }

  async expectRuleCreated() {
    // 应该跳转回列表页或显示成功提示
    await expect(this.page.locator('text=成功, text=Success, [role="alert"]').first()).toBeVisible({ timeout: 5000 });
  }
}

/**
 * 流控规则页面
 */
export class FlowRulePage extends RulePage {
  constructor(page: Page) {
    super(page, 'flow');
  }

  async fillFlowRule(options: {
    resource: string;
    threshold: number;
    grade?: number; // 0-线程数, 1-QPS
    strategy?: number; // 0-直接, 1-关联, 2-链路
    controlBehavior?: number; // 0-快速失败, 1-Warm Up, 2-排队等待
  }) {
    await this.page.fill('[name="resource"], input[placeholder*="资源名"]', options.resource);
    await this.page.fill('[name="count"], input[placeholder*="阈值"]', String(options.threshold));

    if (options.grade !== undefined) {
      await this.page.click('[name="grade"], select[name="grade"]');
      await this.page.selectOption('[name="grade"]', String(options.grade));
    }

    if (options.strategy !== undefined) {
      await this.page.selectOption('[name="strategy"]', String(options.strategy));
    }

    if (options.controlBehavior !== undefined) {
      await this.page.selectOption('[name="controlBehavior"]', String(options.controlBehavior));
    }
  }

  async submitRule() {
    await this.page.click('button[type="submit"], button:has-text("保存"), button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * 熔断规则页面
 */
export class DegradeRulePage extends RulePage {
  constructor(page: Page) {
    super(page, 'degrade');
  }

  async fillDegradeRule(options: {
    resource: string;
    grade: number; // 0-慢调用比例, 1-异常比例, 2-异常数
    count: number;
    timeWindow: number;
    minRequestAmount?: number;
    slowRatioThreshold?: number;
  }) {
    await this.page.fill('[name="resource"], input[placeholder*="资源名"]', options.resource);
    await this.page.selectOption('[name="grade"]', String(options.grade));
    await this.page.fill('[name="count"]', String(options.count));
    await this.page.fill('[name="timeWindow"]', String(options.timeWindow));

    if (options.minRequestAmount !== undefined) {
      await this.page.fill('[name="minRequestAmount"]', String(options.minRequestAmount));
    }

    if (options.slowRatioThreshold !== undefined) {
      await this.page.fill('[name="slowRatioThreshold"]', String(options.slowRatioThreshold));
    }
  }

  async submitRule() {
    await this.page.click('button[type="submit"], button:has-text("保存"), button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * 热点规则页面
 */
export class ParamFlowRulePage extends RulePage {
  constructor(page: Page) {
    super(page, 'param-flow');
  }

  async fillParamFlowRule(options: { resource: string; paramIdx: number; count: number }) {
    await this.page.fill('[name="resource"], input[placeholder*="资源名"]', options.resource);
    await this.page.fill('[name="paramIdx"]', String(options.paramIdx));
    await this.page.fill('[name="count"]', String(options.count));
  }

  async submitRule() {
    await this.page.click('button[type="submit"], button:has-text("保存"), button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * 系统规则页面
 */
export class SystemRulePage extends RulePage {
  constructor(page: Page) {
    super(page, 'system');
  }

  async fillSystemRule(options: {
    highestSystemLoad?: number;
    highestCpuUsage?: number;
    qps?: number;
    avgRt?: number;
    maxThread?: number;
  }) {
    if (options.highestSystemLoad !== undefined) {
      await this.page.fill('[name="highestSystemLoad"]', String(options.highestSystemLoad));
    }
    if (options.highestCpuUsage !== undefined) {
      await this.page.fill('[name="highestCpuUsage"]', String(options.highestCpuUsage));
    }
    if (options.qps !== undefined) {
      await this.page.fill('[name="qps"]', String(options.qps));
    }
    if (options.avgRt !== undefined) {
      await this.page.fill('[name="avgRt"]', String(options.avgRt));
    }
    if (options.maxThread !== undefined) {
      await this.page.fill('[name="maxThread"]', String(options.maxThread));
    }
  }

  async submitRule() {
    await this.page.click('button[type="submit"], button:has-text("保存"), button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * 授权规则页面
 */
export class AuthorityRulePage extends RulePage {
  constructor(page: Page) {
    super(page, 'authority');
  }

  async fillAuthorityRule(options: {
    resource: string;
    limitApp: string;
    strategy: number; // 0-白名单, 1-黑名单
  }) {
    await this.page.fill('[name="resource"], input[placeholder*="资源名"]', options.resource);
    await this.page.fill('[name="limitApp"]', options.limitApp);
    await this.page.selectOption('[name="strategy"]', String(options.strategy));
  }

  async submitRule() {
    await this.page.click('button[type="submit"], button:has-text("保存"), button:has-text("Save")');
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * 簇点链路页面
 */
export class ClusterLinkPage {
  constructor(private page: Page) {}

  async goto(appName: string) {
    await this.page.goto(`/dashboard/apps/${appName}/cluster-link`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    await expect(this.page.locator('main, [data-testid="cluster-link"], table').first()).toBeVisible({
      timeout: 10000,
    });
  }

  async selectInstance(instanceId: string) {
    await this.page.click(`text=${instanceId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async getResourceCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, [data-testid="resource-item"]');
    return await rows.count();
  }

  async addFlowRuleFromResource(resourceName: string) {
    const row = this.page.locator(`tr:has-text("${resourceName}"), [data-resource="${resourceName}"]`);
    await row.locator('button:has-text("流控"), button:has-text("Flow")').click();
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * 机器列表页面
 */
export class InstancePage {
  constructor(private page: Page) {}

  async goto(appName: string) {
    await this.page.goto(`/dashboard/apps/${appName}/instances`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoaded() {
    await expect(this.page.locator('main, [data-testid="instance-list"], table').first()).toBeVisible({
      timeout: 10000,
    });
  }

  async getInstanceCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr, [data-testid="instance-item"]');
    return await rows.count();
  }

  async expectInstanceHealthy(instanceId: string) {
    const instanceRow = this.page.locator(`tr:has-text("${instanceId}")`);
    await expect(instanceRow.locator('text=健康, text=Healthy, .status-healthy')).toBeVisible();
  }
}
