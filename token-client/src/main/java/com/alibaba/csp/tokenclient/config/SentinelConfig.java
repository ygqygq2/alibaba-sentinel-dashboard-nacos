package com.alibaba.csp.tokenclient.config;

import com.alibaba.csp.sentinel.init.InitExecutor;
import com.alibaba.csp.sentinel.transport.config.TransportConfig;
import com.alibaba.csp.sentinel.transport.heartbeat.HeartbeatMessage;
import com.alibaba.csp.sentinel.util.StringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import jakarta.annotation.PostConstruct;
import java.lang.reflect.Field;

/**
 * Sentinel Transport 配置类
 * 
 * 负责：
 * 1. 启动 Command Center (监听 csp.sentinel.api.port，默认 8720)
 * 2. 启动 HeartbeatSender (定时发送心跳到 Dashboard)
 * 3. 注入 app_secret 到心跳消息中 (使用反射方式)
 * 
 * 注意：
 * - 使用反射注入 app_secret 到默认的 HeartbeatSender
 * - 避免 Spring Boot Fat JAR 的 SPI 加载问题
 * - 必须在 ClusterClientConfigurer 之前执行 (Order = 0)
 */
@Configuration
@Order(0)
public class SentinelConfig {

    private static final Logger logger = LoggerFactory.getLogger(SentinelConfig.class);
    
    /**
     * 默认心跳 API 路径（与 Dashboard 的 Instance API 匹配）
     */
    private static final String DEFAULT_HEARTBEAT_API_PATH = "/registry/instance";

    @PostConstruct
    public void init() {
        logger.info("Initializing Sentinel Transport components...");
        
        // 设置默认心跳路径（如果用户未手动配置）
        configureDefaultHeartbeatPath();
        
        // 强制设置 Dashboard 地址（确保心跳发送器能读取到）
        String dashboardServer = System.getProperty("csp.sentinel.dashboard.server");
        if (StringUtil.isNotBlank(dashboardServer)) {
            logger.info("Dashboard server configured: {}", dashboardServer);
        } else {
            logger.warn("Dashboard server NOT configured - heartbeat will not be sent");
        }
        
        // Sentinel 的 InitExecutor 会调用 HeartbeatSender 启动心跳
        InitExecutor.doInit();
        logger.info("Sentinel Transport initialized successfully");
        
        // 注入 app_secret 到心跳消息中（用于 Dashboard 鉴权）
        if (StringUtil.isNotBlank(dashboardServer)) {
            injectAppSecretToHeartbeat();
        }
        
        // 记录鉴权配置状态
        String appSecret = System.getProperty("csp.sentinel.app.secret");
        if (StringUtil.isNotBlank(appSecret)) {
            logger.info("Cluster Client heartbeat authentication ENABLED");
            logger.info("  - heartbeat: includes app_secret parameter");
        } else {
            logger.warn("Cluster Client heartbeat authentication DISABLED");
        }
    }
    
    /**
     * 配置默认心跳路径
     */
    private void configureDefaultHeartbeatPath() {
        String existingPath = com.alibaba.csp.sentinel.config.SentinelConfig.getConfig(TransportConfig.HEARTBEAT_API_PATH);
        if (StringUtil.isBlank(existingPath)) {
            com.alibaba.csp.sentinel.config.SentinelConfig.setConfig(TransportConfig.HEARTBEAT_API_PATH, DEFAULT_HEARTBEAT_API_PATH);
            logger.info("Heartbeat API path set to default: {}", DEFAULT_HEARTBEAT_API_PATH);
        } else {
            logger.info("Heartbeat API path already configured: {}", existingPath);
        }
    }
    
    /**
     * 注入 app_secret 到心跳消息中
     * 通过反射访问 HeartbeatSender 的 HeartbeatMessage 实例
     */
    private void injectAppSecretToHeartbeat() {
        String appSecret = System.getProperty("csp.sentinel.app.secret");
        if (StringUtil.isBlank(appSecret)) {
            logger.info("No app_secret configured, heartbeat will not include authentication");
            return;
        }
        
        try {
            // 获取 HeartbeatSenderProvider 中的 HeartbeatSender 实例
            Class<?> heartbeatSenderProviderClass = Class.forName(
                "com.alibaba.csp.sentinel.heartbeat.HeartbeatSenderProvider");
            Field senderField = heartbeatSenderProviderClass.getDeclaredField("heartbeatSender");
            senderField.setAccessible(true);
            Object heartbeatSender = senderField.get(null);
            
            if (heartbeatSender == null) {
                logger.warn("HeartbeatSender not initialized, cannot inject app_secret");
                return;
            }
            
            // 获取 HeartbeatSender 中的 HeartbeatMessage 实例
            Field heartbeatField = heartbeatSender.getClass().getDeclaredField("heartBeat");
            heartbeatField.setAccessible(true);
            HeartbeatMessage heartbeatMessage = (HeartbeatMessage) heartbeatField.get(heartbeatSender);
            
            if (heartbeatMessage != null) {
                // 注册 app_secret 到心跳消息
                heartbeatMessage.registerInformation("app_secret", appSecret);
                logger.info("Successfully injected app_secret into heartbeat message");
            } else {
                logger.warn("HeartbeatMessage not found in HeartbeatSender");
            }
        } catch (Exception e) {
            logger.error("Failed to inject app_secret into heartbeat: {}", e.getMessage(), e);
        }
    }
}
