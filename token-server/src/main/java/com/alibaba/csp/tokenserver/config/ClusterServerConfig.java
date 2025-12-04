package com.alibaba.csp.tokenserver.config;

import com.alibaba.csp.sentinel.cluster.ClusterStateManager;
import com.alibaba.csp.sentinel.cluster.flow.rule.ClusterFlowRuleManager;
import com.alibaba.csp.sentinel.cluster.flow.rule.ClusterParamFlowRuleManager;
import com.alibaba.csp.sentinel.cluster.server.ClusterTokenServer;
import com.alibaba.csp.sentinel.cluster.server.SentinelDefaultTokenServer;
import com.alibaba.csp.sentinel.cluster.server.config.ClusterServerConfigManager;
import com.alibaba.csp.sentinel.cluster.server.config.ServerTransportConfig;
import com.alibaba.csp.sentinel.datasource.ReadableDataSource;
import com.alibaba.csp.sentinel.datasource.nacos.NacosDataSource;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRule;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 独立模式集群 Token Server 配置
 * 
 * 参考 Sentinel 官方 demo: sentinel-demo-cluster-server-alone
 * 
 * Token Server 独立部署，为所有需要集群限流的应用提供令牌分发服务。
 * 
 * 架构：
 * ┌─────────────────┐
 * │  Token Server   │◄───── App A (多实例)
 * │  (本服务)        │◄───── App B (多实例)  
 * │  Port: 18730    │◄───── App C (多实例)
 * └────────┬────────┘
 *          │ 规则从 Nacos 动态加载
 *          ▼
 *     ┌─────────┐
 *     │  Nacos  │
 *     └─────────┘
 */
@Configuration
public class ClusterServerConfig {

    private static final Logger logger = LoggerFactory.getLogger(ClusterServerConfig.class);

    @Value("${sentinel.cluster.server.port:18730}")
    private int clusterServerPort;

    @Value("${sentinel.cluster.server.idle-seconds:600}")
    private int idleSeconds;

    @Value("${nacos.server-addr:localhost:8848}")
    private String nacosServerAddr;

    @Value("${nacos.group-id:SENTINEL_GROUP}")
    private String nacosGroupId;

    @Value("${sentinel.cluster.namespaces:}")
    private String namespaces;

    private ClusterTokenServer tokenServer;

    @PostConstruct
    public void init() throws Exception {
        logger.info("==============================================");
        logger.info("Starting Sentinel Cluster Token Server (Alone Mode)");
        logger.info("Cluster Server Port: {}", clusterServerPort);
        logger.info("Nacos Server: {}", nacosServerAddr);
        logger.info("Nacos Group: {}", nacosGroupId);
        logger.info("==============================================");

        // 1. 加载全局传输配置
        ClusterServerConfigManager.loadGlobalTransportConfig(
            new ServerTransportConfig()
                .setPort(clusterServerPort)
                .setIdleSeconds(idleSeconds)
        );

        // 2. 加载命名空间集合 (每个需要集群限流的应用就是一个 namespace)
        Set<String> namespaceSet = parseNamespaces();
        if (!namespaceSet.isEmpty()) {
            ClusterServerConfigManager.loadServerNamespaceSet(namespaceSet);
            logger.info("Loaded namespaces: {}", namespaceSet);
        }

        // 3. 注册规则数据源供应器 - 从 Nacos 加载各应用的规则
        registerClusterRuleSupplier();

        // 4. 设置集群状态为 SERVER 模式 (重要：让 Dashboard 识别为 Token Server)
        ClusterStateManager.setToServer();
        logger.info("Set cluster state to SERVER mode");

        // 5. 创建并启动 Token Server (独立模式，非嵌入模式)
        // 使用 false 参数表示独立模式
        tokenServer = new SentinelDefaultTokenServer(false);
        tokenServer.start();
        
        // 6. 确保 embedded 标志为 false (独立模式)
        // 注意：SentinelDefaultTokenServer 内部可能会在某些情况下设置为 true
        ClusterServerConfigManager.setEmbedded(false);
        logger.info("Set embedded mode to false (Standalone/Alone mode)");

        logger.info("==============================================");
        logger.info("Cluster Token Server started successfully!");
        logger.info("Listening on port: {}", clusterServerPort);
        logger.info("==============================================");
    }

    @PreDestroy
    public void destroy() throws Exception {
        if (tokenServer != null) {
            logger.info("Stopping Cluster Token Server...");
            tokenServer.stop();
            logger.info("Cluster Token Server stopped.");
        }
    }

    /**
     * 解析命名空间配置
     * 格式: app1,app2,app3 或从 Nacos 动态加载
     */
    private Set<String> parseNamespaces() {
        Set<String> result = new HashSet<>();
        if (namespaces != null && !namespaces.trim().isEmpty()) {
            String[] parts = namespaces.split(",");
            for (String part : parts) {
                String ns = part.trim();
                if (!ns.isEmpty()) {
                    result.add(ns);
                }
            }
        }
        return result;
    }

    /**
     * 注册规则数据源供应器
     * 
     * 当客户端请求令牌时，Token Server 需要知道对应的规则。
     * 这里注册一个规则供应器，根据 namespace (即 app 名称) 从 Nacos 加载规则。
     */
    private void registerClusterRuleSupplier() {
        // 注册流控规则供应器
        ClusterFlowRuleManager.setPropertySupplier(namespace -> {
            // 从 Nacos 加载对应应用的流控规则
            String dataId = namespace + "-flow-rules";
            ReadableDataSource<String, List<FlowRule>> ds = new NacosDataSource<>(
                nacosServerAddr, nacosGroupId, dataId,
                source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {})
            );
            logger.info("Registered flow rule data source for namespace: {}, dataId: {}", namespace, dataId);
            return ds.getProperty();
        });

        // 注册热点参数规则供应器
        ClusterParamFlowRuleManager.setPropertySupplier(namespace -> {
            String dataId = namespace + "-param-flow-rules";
            ReadableDataSource<String, List<ParamFlowRule>> ds = new NacosDataSource<>(
                nacosServerAddr, nacosGroupId, dataId,
                source -> JSON.parseObject(source, new TypeReference<List<ParamFlowRule>>() {})
            );
            logger.info("Registered param flow rule data source for namespace: {}, dataId: {}", namespace, dataId);
            return ds.getProperty();
        });

        logger.info("Cluster rule suppliers registered.");
    }
}
