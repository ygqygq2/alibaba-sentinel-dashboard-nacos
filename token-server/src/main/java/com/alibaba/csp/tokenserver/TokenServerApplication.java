package com.alibaba.csp.tokenserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Sentinel Cluster Token Server - 独立模式
 * 
 * 为所有需要集群限流的应用提供统一的令牌分发服务。
 * 
 * 架构说明：
 * ┌─────────────────┐
 * │  Sentinel       │
 * │  Dashboard      │
 * └────────┬────────┘
 *          │ 管理
 *          ▼
 * ┌─────────────────┐      ┌──────────────┐
 * │  Token Server   │◄─────│  App A (多实例) │
 * │  (本服务)        │◄─────│  App B (多实例) │
 * │  Port: 18730    │◄─────│  App C (多实例) │
 * └────────┬────────┘      └──────────────┘
 *          │ 规则存储
 *          ▼
 *     ┌─────────┐
 *     │  Nacos  │
 *     └─────────┘
 * 
 * 配置参数：
 * - sentinel.cluster.server.port: Token Server 监听端口 (默认 18730)
 * - nacos.server-addr: Nacos 服务地址
 * - sentinel.cluster.namespaces: 命名空间列表（逗号分隔的应用名）
 * 
 * 客户端应用配置：
 * - 配置集群客户端模式
 * - 指定 Token Server 地址: token-server:18730
 */
@SpringBootApplication
public class TokenServerApplication {

  public static void main(String[] args) {
    SpringApplication.run(TokenServerApplication.class, args);
  }
}
