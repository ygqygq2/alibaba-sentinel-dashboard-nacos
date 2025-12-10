/**
 * Sentinel Dashboard 数据类型定义
 */

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = unknown> {
  code: number;
  msg?: string;
  data: T;
}

/**
 * 分页响应结构
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 应用信息（后端返回原始格式）
 */
export interface AppInfoRaw {
  /** 应用名称 */
  app: string;
  /** 应用类型：0-普通应用，1-网关应用 */
  appType: number;
  /** 实例列表 */
  instances?: InstanceInfo[];
}

/**
 * 应用信息（前端展示格式）
 */
export interface AppInfo {
  /** 应用名称 */
  app: string;
  /** 应用类型：0-普通应用，1-网关应用 */
  appType: number;
  /** 活跃的实例数 */
  activeCount: number;
  /** 健康的实例数 */
  healthCount: number;
  /** 不健康的实例数 */
  unhealthyCount: number;
  /** 最近心跳时间 */
  lastHeartbeat?: number;
}

/**
 * 实例信息
 */
export interface InstanceInfo {
  /** 应用名称 */
  app: string;
  /** 实例 ID */
  id: string;
  /** 主机名 */
  hostname: string;
  /** IP 地址 */
  ip: string;
  /** 域名（可选，例如 service.namespace.svc.cluster.local） */
  domain?: string;
  /** 自定义名称（可选，例如 StatefulSet pod 名 "token-server-0"） */
  name?: string;
  /** 端口 */
  port: number;
  /** Sentinel 版本 */
  version?: string;
  /** 最近心跳时间戳 */
  lastHeartbeat?: number;
  /** 心跳版本 */
  heartbeatVersion?: number;
  /** 是否健康 */
  healthy: boolean;
  /** 时间戳 */
  timestamp?: number;
}

/**
 * 资源信息
 */
export interface ResourceInfo {
  /** 资源名称 */
  resource: string;
  /** 通过 QPS */
  passQps: number;
  /** 阻止 QPS */
  blockQps: number;
  /** 成功 QPS */
  successQps: number;
  /** 异常 QPS */
  exceptionQps: number;
  /** 平均 RT（毫秒） */
  rt: number;
  /** 并发数 */
  concurrency: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 实时监控数据
 */
export interface MetricData {
  /** 资源名称 */
  resource: string;
  /** 实例标识（仅在实例视图下有值，格式：ip:port） */
  instance?: string;
  /** 时间戳 */
  timestamp: number;
  /** 通过请求数 */
  passQps: number;
  /** 成功请求数 */
  successQps: number;
  /** 阻止请求数 */
  blockQps: number;
  /** 异常请求数 */
  exceptionQps: number;
  /** 平均响应时间 */
  rt: number;
  /** 并发线程数 */
  count: number;
}

/**
 * 簇点链路资源数据（从后端 ResourceVo 映射）
 */
export interface ClusterNode {
  /** 资源 ID（用于树形结构） */
  id?: string;
  /** 父资源 ID */
  parentId?: string;
  /** 资源名称 */
  resource: string;
  /** 线程数 */
  threadNum: number;
  /** 通过 QPS */
  passQps: number;
  /** 阻止 QPS */
  blockQps: number;
  /** 总 QPS */
  totalQps: number;
  /** 平均 RT */
  averageRt: number;
  /** 分钟通过数 */
  oneMinutePass: number;
  /** 分钟阻止数 */
  oneMinuteBlock: number;
  /** 分钟异常数 */
  oneMinuteException: number;
  /** 分钟总数 */
  oneMinuteTotal: number;
  /** 异常 QPS */
  exceptionQps: number;
  /** 是否可见（用于树形过滤） */
  visible?: boolean;
  /** 子节点 */
  children?: ClusterNode[];
}
