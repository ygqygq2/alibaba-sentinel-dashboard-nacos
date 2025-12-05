/**
 * Sentinel 规则类型定义
 */

/**
 * 流控规则基础字段
 */
export interface FlowRuleBase {
  /** 规则 ID */
  id?: number;
  /** 资源名称 */
  resource: string;
  /** 应用名称 */
  app: string;
  /** 限流阈值类型：0-线程数，1-QPS */
  grade: number;
  /** 阈值 */
  count: number;
  /** 流控模式：0-直接，1-关联，2-链路 */
  strategy: number;
  /** 关联资源（strategy=1 时有效） */
  refResource?: string;
  /** 流控效果：0-快速失败，1-Warm Up，2-排队等待 */
  controlBehavior: number;
  /** 预热时长（秒，controlBehavior=1 时有效） */
  warmUpPeriodSec?: number;
  /** 超时时间（毫秒，controlBehavior=2 时有效） */
  maxQueueingTimeMs?: number;
  /** 来源 */
  limitApp: string;
  /** 是否集群模式 */
  clusterMode?: boolean;
  /** 集群配置 */
  clusterConfig?: ClusterFlowConfig;
}

/**
 * 集群流控配置
 */
export interface ClusterFlowConfig {
  /** 流控 ID */
  flowId?: number;
  /** 阈值类型：0-单机均摊，1-总体阈值 */
  thresholdType: number;
  /** 是否回退到本地限流 */
  fallbackToLocalWhenFail?: boolean;
  /** 采样数量 */
  sampleCount?: number;
  /** 窗口时间间隔（毫秒） */
  windowIntervalMs?: number;
}

/**
 * 流控规则
 */
export interface FlowRule extends FlowRuleBase {
  /** 规则 ID */
  id: number;
  /** 创建时间 */
  gmtCreate?: number;
  /** 修改时间 */
  gmtModified?: number;
}

/**
 * 降级规则
 */
export interface DegradeRule {
  /** 规则 ID */
  id?: number;
  /** 资源名称 */
  resource: string;
  /** 应用名称 */
  app: string;
  /** 降级策略：0-慢调用比例，1-异常比例，2-异常数 */
  grade: number;
  /** 阈值 */
  count: number;
  /** 时间窗口（秒） */
  timeWindow: number;
  /** 最小请求数（grade=0 或 1 时有效） */
  minRequestAmount: number;
  /** 慢调用比例阈值（grade=0 时有效） */
  slowRatioThreshold?: number;
  /** 最大 RT（毫秒，grade=0 时有效） */
  statIntervalMs?: number;
}

/**
 * 热点参数规则
 */
export interface ParamFlowRule {
  /** 规则 ID */
  id?: number;
  /** 资源名称 */
  resource: string;
  /** 应用名称 */
  app: string;
  /** 参数索引 */
  paramIdx: number;
  /** 限流阈值类型：0-线程数，1-QPS */
  grade: number;
  /** 单机阈值 */
  count: number;
  /** 统计窗口时长（秒） */
  durationInSec: number;
  /** 流控效果：0-快速失败，1-Warm Up，2-排队等待 */
  controlBehavior: number;
  /** 参数类型 */
  paramFlowItemList?: ParamFlowItem[];
  /** 是否集群模式 */
  clusterMode?: boolean;
  /** 集群配置 */
  clusterConfig?: ClusterFlowConfig;
}

/**
 * 热点参数项
 */
export interface ParamFlowItem {
  /** 参数类型 */
  classType: string;
  /** 参数值 */
  object: string;
  /** 限流阈值 */
  count: number;
}

/**
 * 系统规则
 */
export interface SystemRule {
  /** 规则 ID */
  id?: number;
  /** 应用名称 */
  app: string;
  /** 最高系统负载 */
  highestSystemLoad?: number;
  /** CPU 使用率阈值 */
  highestCpuUsage?: number;
  /** 入口 QPS 阈值 */
  qps?: number;
  /** 平均 RT 阈值 */
  avgRt?: number;
  /** 最大并发线程数 */
  maxThread?: number;
}

/**
 * 授权规则
 */
export interface AuthorityRule {
  /** 规则 ID */
  id?: number;
  /** 资源名称 */
  resource: string;
  /** 应用名称 */
  app: string;
  /** 限制应用列表（逗号分隔） */
  limitApp: string;
  /** 策略：0-白名单，1-黑名单 */
  strategy: number;
}

/**
 * 网关 API 定义
 */
export interface GatewayApi {
  /** API ID */
  id?: number;
  /** 应用名称 */
  app: string;
  /** API 名称 */
  apiName: string;
  /** 匹配模式列表 */
  predicateItems: GatewayPredicateItem[];
}

/**
 * 网关 API 匹配项
 */
export interface GatewayPredicateItem {
  /** 匹配模式：0-精确匹配，1-前缀匹配，2-正则匹配 */
  matchStrategy: number;
  /** 匹配路径 */
  pattern: string;
}

/**
 * 网关流控规则
 */
export interface GatewayFlowRule {
  /** 规则 ID */
  id?: number;
  /** 应用名称 */
  app: string;
  /** 资源名称 */
  resource: string;
  /** 资源模式：0-Route ID，1-API 分组 */
  resourceMode: number;
  /** 限流阈值类型：0-线程数，1-QPS */
  grade: number;
  /** 阈值 */
  count: number;
  /** 统计时间窗口（秒） */
  intervalSec: number;
  /** 流控效果：0-快速失败，1-排队等待 */
  controlBehavior: number;
  /** 突发数量 */
  burst?: number;
  /** 最大排队时间（毫秒） */
  maxQueueingTimeoutMs?: number;
  /** 参数解析配置 */
  paramItem?: GatewayParamItem;
}

/**
 * 网关参数解析配置
 */
export interface GatewayParamItem {
  /** 解析策略 */
  parseStrategy: number;
  /** 字段名称 */
  fieldName?: string;
  /** 匹配模式 */
  pattern?: string;
  /** 匹配策略 */
  matchStrategy?: number;
}
