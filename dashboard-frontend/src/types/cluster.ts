/**
 * Sentinel 集群流控类型定义
 */

/**
 * 集群状态
 */
export interface ClusterState {
  /** 应用名称 */
  app: string;
  /** 实例 ID */
  instanceId: string;
  /** IP 地址 */
  ip: string;
  /** 端口 */
  port: number;
  /** 状态信息 */
  stateInfo: ClusterStateInfo;
}

/**
 * 集群状态详情
 */
export interface ClusterStateInfo {
  /** 模式：0-单机，1-Token Server，2-Token Client */
  mode: number;
  /** 是否嵌入模式 */
  embedded?: boolean;
  /** Client 配置（mode=2 时有效） */
  client?: ClusterClientConfig;
  /** Server 配置（mode=1 时有效） */
  server?: ClusterServerConfig;
}

/**
 * 集群 Client 配置
 */
export interface ClusterClientConfig {
  /** 请求超时（毫秒） */
  requestTimeout?: number;
  /** 服务端 IP */
  serverHost?: string;
  /** 服务端端口 */
  serverPort?: number;
}

/**
 * 集群 Server 配置
 */
export interface ClusterServerConfig {
  /** 端口 */
  port?: number;
  /** 空闲时间（秒） */
  idleSeconds?: number;
  /** 命名空间集合 */
  namespaceSet?: string[];
}

/**
 * Token Server 信息
 */
export interface TokenServer {
  /** 应用名称 */
  app: string;
  /** 实例 ID */
  instanceId: string;
  /** IP 地址 */
  ip: string;
  /** 端口 */
  port: number;
  /** Token Server 端口 */
  tokenServerPort?: number;
  /** 命名空间集合 */
  namespaceSet?: string[];
  /** 是否嵌入模式 */
  embedded: boolean;
  /** 当前客户端数量 */
  currentClientCount?: number;
  /** 最大允许 QPS */
  maxAllowedQps?: number;
}

/**
 * Token Client 信息
 */
export interface TokenClient {
  /** 应用名称 */
  app: string;
  /** 实例 ID */
  instanceId: string;
  /** IP 地址 */
  ip: string;
  /** 端口 */
  port: number;
  /** 服务端 IP */
  serverHost?: string;
  /** 服务端端口 */
  serverPort?: number;
  /** 请求超时（毫秒） */
  requestTimeout?: number;
}

/**
 * 集群分配请求
 */
export interface ClusterAssignRequest {
  /** Token Server 实例 ID */
  instanceId: string;
  /** 要分配的命名空间列表 */
  namespaceSet: string[];
  /** 是否为新的 Token Server */
  newServer?: boolean;
}

/**
 * 集群解绑请求
 */
export interface ClusterUnbindRequest {
  /** 应用名称 */
  app: string;
  /** 实例 ID */
  instanceId: string;
}

/**
 * Token Server 分配状态
 */
export interface ClusterAssignState {
  /** 应用名称 */
  app: string;
  /** 实例列表 */
  instances: ClusterInstanceState[];
  /** 已分配的 Token Server */
  assignedServer?: TokenServer;
}

/**
 * 集群实例状态
 */
export interface ClusterInstanceState {
  /** 实例 ID */
  instanceId: string;
  /** IP 地址 */
  ip: string;
  /** 端口 */
  port: number;
  /** 是否可以作为 Token Server */
  belongToApp: boolean;
  /** 当前模式 */
  mode: number;
  /** 是否被选中 */
  selected?: boolean;
}
