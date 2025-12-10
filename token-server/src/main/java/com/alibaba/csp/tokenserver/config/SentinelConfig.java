package com.alibaba.csp.tokenserver.config;

import com.alibaba.csp.sentinel.annotation.aspectj.SentinelResourceAspect;
import com.alibaba.csp.sentinel.command.CommandHandler;
import com.alibaba.csp.sentinel.command.handler.AuthenticatedFetchActiveRuleCommandHandler;
import com.alibaba.csp.sentinel.command.handler.AuthenticatedModifyClusterModeCommandHandler;
import com.alibaba.csp.sentinel.command.handler.AuthenticatedModifyRulesCommandHandler;
import com.alibaba.csp.sentinel.init.InitExecutor;
import com.alibaba.csp.sentinel.transport.config.TransportConfig;
import com.alibaba.csp.sentinel.transport.heartbeat.HeartbeatMessage;
import com.alibaba.csp.sentinel.util.StringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.lang.reflect.Field;
import java.util.Map;

/**
 * Sentinel Transport 配置类 - 初始化 Sentinel Transport 组件
 * 
 * 负责：
 * 1. 启动 Command Center (监听 csp.sentinel.api.port，默认 8719)
 * 2. 启动 HeartbeatSender (定时发送心跳到 Dashboard)
 * 3. 启用 @SentinelResource 注解支持
 * 4. 加载 SPI 自定义 CommandHandler (getRules/setRules 鉴权)
 * 
 * 鉴权机制：
 * - 通过 SPI 机制注册自定义 CommandHandler
 * - 验证 app_secret 参数（从 JVM 参数读取 -Dcsp.sentinel.app.secret）
 * - 如果未配置 app_secret，则不启用鉴权
 * - 生产环境建议同时使用网络层访问控制
 * 
 * 心跳路径配置：
 * - 默认使用 /registry/instance 路径（与 Dashboard 新 API 匹配）
 * - 自动在心跳中添加 app_secret 参数（如果已配置）
 * 
 * 注意：
 * - Cluster Token Server 的启动在 ClusterServerConfig 中处理
 */
@Configuration
public class SentinelConfig {

    private static final Logger logger = LoggerFactory.getLogger(SentinelConfig.class);
    
    /**
     * 默认心跳 API 路径（与 Dashboard 的新 Instance API 匹配）
     */
    private static final String DEFAULT_HEARTBEAT_API_PATH = "/registry/instance";

    @PostConstruct
    public void init() {
        logger.info("Initializing Sentinel Transport components...");
        
        // 设置默认心跳路径（如果用户未手动配置）
        // 必须在 InitExecutor.doInit() 之前设置
        configureDefaultHeartbeatPath();
        
        // 强制设置 Dashboard 地址（确保心跳发送器能读取到）
        String dashboardServer = System.getProperty("csp.sentinel.dashboard.server");
        if (StringUtil.isNotBlank(dashboardServer)) {
            logger.info("Dashboard server configured: {}", dashboardServer);
        } else {
            logger.warn("Dashboard server NOT configured - heartbeat will not be sent");
        }
        
        // Sentinel 的 InitExecutor 会调用 CommandHandlerProvider 加载 SPI
        // 同时会启动 HeartbeatSender（如果配置了 csp.sentinel.dashboard.server）
        InitExecutor.doInit();
        logger.info("Sentinel Transport initialized successfully");
        
        // 注入 app_secret 到心跳消息中（用于 Dashboard 鉴权）
        if (StringUtil.isNotBlank(dashboardServer)) {
            injectAppSecretToHeartbeat();
        }
        
        // 由于 Spring Boot Fat JAR 的类加载问题，SPI 无法正常加载自定义 Handler
        // 这里使用反射手动注册到 SimpleHttpCommandCenter 的 handlerMap
        registerAuthenticatedHandlers();
        
        // 记录鉴权配置状态
        String appSecret = System.getProperty("csp.sentinel.app.secret");
        if (StringUtil.isNotBlank(appSecret)) {
            logger.info("Client API authentication ENABLED (app_secret configured)");
            logger.info("  - getRules command: requires app_secret parameter");
            logger.info("  - setRules command: requires app_secret parameter");
            logger.info("  - setClusterMode command: requires app_secret parameter");
            logger.info("  - heartbeat: includes app_secret parameter");
        } else {
            logger.warn("Client API authentication DISABLED (app_secret not configured)");
            logger.warn("  Port 8719 is UNPROTECTED - use network-level access control in production!");
        }
    }
    
    /**
     * 配置默认心跳路径
     * 如果用户未手动指定 csp.sentinel.heartbeat.api.path，则使用项目默认值
     */
    private void configureDefaultHeartbeatPath() {
        String existingPath = com.alibaba.csp.sentinel.config.SentinelConfig.getConfig(TransportConfig.HEARTBEAT_API_PATH);
        if (StringUtil.isBlank(existingPath)) {
            // 设置为新的 Instance API 路径
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
    
    /**
     * 通过反射注册带鉴权的 CommandHandler
     * SimpleHttpCommandCenter.handlerMap 是 private static final Map
     */
    @SuppressWarnings({"unchecked", "rawtypes"})
    private void registerAuthenticatedHandlers() {
        try {
            Class<?> commandCenterClass = Class.forName(
                "com.alibaba.csp.sentinel.transport.command.SimpleHttpCommandCenter");
            
            java.lang.reflect.Field handlerMapField = commandCenterClass.getDeclaredField("handlerMap");
            handlerMapField.setAccessible(true);
            
            // handlerMap 是 static 的，传 null 即可获取
            Map<String, CommandHandler> handlerMap = (Map<String, CommandHandler>) handlerMapField.get(null);
            
            // 注册带鉴权的 Handler，覆盖官方实现
            handlerMap.put("getRules", new AuthenticatedFetchActiveRuleCommandHandler());
            handlerMap.put("setRules", new AuthenticatedModifyRulesCommandHandler());
            handlerMap.put("setClusterMode", new AuthenticatedModifyClusterModeCommandHandler());
            
            logger.info("Successfully registered authenticated CommandHandlers (getRules, setRules, setClusterMode)");
        } catch (Exception e) {
            logger.error("Failed to register authenticated CommandHandlers: {}", e.getMessage(), e);
        }
    }

    /**
     * 启用 @SentinelResource 注解支持
     */
    @Bean
    public SentinelResourceAspect sentinelResourceAspect() {
        return new SentinelResourceAspect();
    }
}
