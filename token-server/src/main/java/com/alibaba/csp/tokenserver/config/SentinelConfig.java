package com.alibaba.csp.tokenserver.config;

import com.alibaba.csp.sentinel.annotation.aspectj.SentinelResourceAspect;
import com.alibaba.csp.sentinel.init.InitExecutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

/**
 * Sentinel Transport 配置类 - 初始化 Sentinel Transport 组件
 * 
 * 负责：
 * 1. 启动 Command Center (监听 csp.sentinel.api.port，默认 8719)
 * 2. 启动 HeartbeatSender (定时发送心跳到 Dashboard)
 * 3. 启用 @SentinelResource 注解支持
 * 
 * 注意：Cluster Token Server 的启动在 ClusterServerConfig 中处理
 */
@Configuration
public class SentinelConfig {

    private static final Logger logger = LoggerFactory.getLogger(SentinelConfig.class);

    @PostConstruct
    public void init() {
        logger.info("Initializing Sentinel Transport components...");
        InitExecutor.doInit();
        logger.info("Sentinel Transport initialized successfully");
    }

    /**
     * 启用 @SentinelResource 注解支持
     */
    @Bean
    public SentinelResourceAspect sentinelResourceAspect() {
        return new SentinelResourceAspect();
    }
}
