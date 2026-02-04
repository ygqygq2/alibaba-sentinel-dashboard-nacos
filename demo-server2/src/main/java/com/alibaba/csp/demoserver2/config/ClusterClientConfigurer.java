package com.alibaba.csp.demoserver2.config;

import com.alibaba.csp.sentinel.cluster.ClusterStateManager;
import com.alibaba.csp.sentinel.cluster.client.config.ClusterClientAssignConfig;
import com.alibaba.csp.sentinel.cluster.client.config.ClusterClientConfigManager;
import com.alibaba.csp.sentinel.datasource.ReadableDataSource;
import com.alibaba.csp.sentinel.datasource.nacos.NacosDataSource;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Properties;

@Configuration
@Order(10)
public class ClusterClientConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(ClusterClientConfigurer.class);

    @Value("${nacos.server-addr}")
    private String nacosServerAddr;

    @Value("${token.server.host:token-server}")
    private String tokenServerHost;

    @Value("${token.server.port:18730}")
    private Integer tokenServerPort;

    @Value("${spring.application.name}")
    private String appName;

    @PostConstruct
    public void init() {
        // 1. 配置集群客户端模式
        ClusterStateManager.applyState(ClusterStateManager.CLUSTER_CLIENT);
        logger.info("已配置为集群客户端模式");

        // 2. 配置 Token Server 地址
        ClusterClientAssignConfig assignConfig = new ClusterClientAssignConfig();
        assignConfig.setServerHost(tokenServerHost);
        assignConfig.setServerPort(tokenServerPort);
        ClusterClientConfigManager.applyNewAssignConfig(assignConfig);
        logger.info("Token Server 地址: {}:{}", tokenServerHost, tokenServerPort);

        // 3. 配置客户端参数
        com.alibaba.csp.sentinel.cluster.client.config.ClusterClientConfig clientConfig = 
            new com.alibaba.csp.sentinel.cluster.client.config.ClusterClientConfig();
        clientConfig.setRequestTimeout(20000); // 请求超时 20 秒
        ClusterClientConfigManager.applyNewConfig(clientConfig);
        logger.info("集群客户端配置完成");

        // 4. 从 Nacos 加载流控规则
        loadFlowRulesFromNacos();
    }

    private void loadFlowRulesFromNacos() {
        try {
            String dataId = appName + "-flow-rules";
            String groupId = "SENTINEL_GROUP";
            
            // 创建 Nacos 配置属性（包含认证信息）
            Properties properties = new Properties();
            properties.put("serverAddr", nacosServerAddr);
            properties.put("username", "nacos");
            properties.put("password", "nacos");

            ReadableDataSource<String, List<FlowRule>> flowRuleDataSource = new NacosDataSource<>(
                    properties,
                    groupId,
                    dataId,
                    source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {})
            );

            FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
            logger.info("已从 Nacos 加载流控规则: dataId={}, groupId={}", dataId, groupId);

            // 打印当前规则
            List<FlowRule> rules = FlowRuleManager.getRules();
            if (rules != null && !rules.isEmpty()) {
                logger.info("当前流控规则数量: {}", rules.size());
                rules.forEach(rule -> logger.info("流控规则: resource={}, count={}, clusterMode={}", 
                    rule.getResource(), rule.getCount(), rule.isClusterMode()));
            } else {
                logger.info("当前无流控规则");
            }
        } catch (Exception e) {
            logger.error("从 Nacos 加载流控规则失败", e);
        }
    }
}
