package com.alibaba.csp.tokenserver.config;

import com.alibaba.csp.sentinel.datasource.ReadableDataSource;
import com.alibaba.csp.sentinel.datasource.nacos.NacosDataSource;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRule;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRuleManager;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Properties;

/**
 * Token Server 应用自身的 Nacos 规则数据源配置
 * 
 * 与 ClusterServerConfig 的区别：
 * - ClusterServerConfig: 配置集群流控规则（供其他应用使用）
 * - NacosDataSourceConfig: 配置本应用的流控规则（/api/hello 等接口）
 * 
 * 功能：
 * - 从 Nacos 加载 token-server 应用自己的流控规则
 * - 从 Nacos 加载 token-server 应用自己的降级规则
 * - 实时监听 Nacos 配置变更
 */
@Configuration
public class NacosDataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(NacosDataSourceConfig.class);

    @Value("${spring.application.name}")
    private String appName;

    @Value("${nacos.server-addr:localhost:8848}")
    private String nacosServerAddr;

    @Value("${nacos.username:nacos}")
    private String nacosUsername;

    @Value("${nacos.password:nacos}")
    private String nacosPassword;

    @Value("${nacos.group-id:SENTINEL_GROUP}")
    private String nacosGroupId;

    @PostConstruct
    public void init() {
        logger.info("==============================================");
        logger.info("Loading Token Server Application Rules from Nacos");
        logger.info("App Name: {}", appName);
        logger.info("Nacos Server: {}", nacosServerAddr);
        logger.info("Nacos Group: {}", nacosGroupId);
        logger.info("==============================================");

        // 1. 加载流控规则
        String flowRuleDataId = appName + "-flow-rules";
        Properties nacosProperties = new Properties();
        nacosProperties.put("serverAddr", nacosServerAddr);
        nacosProperties.put("username", nacosUsername);
        nacosProperties.put("password", nacosPassword);
        
        ReadableDataSource<String, List<FlowRule>> flowRuleDataSource = new NacosDataSource<>(
                nacosProperties,
                nacosGroupId,
                flowRuleDataId,
                source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {})
        );
        FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
        logger.info("✅ Registered flow rule data source: dataId={}, group={}", flowRuleDataId, nacosGroupId);

        // 2. 加载降级规则
        String degradeRuleDataId = appName + "-degrade-rules";
        ReadableDataSource<String, List<DegradeRule>> degradeRuleDataSource = new NacosDataSource<>(
                nacosProperties,
                nacosGroupId,
                degradeRuleDataId,
                source -> JSON.parseObject(source, new TypeReference<List<DegradeRule>>() {})
        );
        DegradeRuleManager.register2Property(degradeRuleDataSource.getProperty());
        logger.info("✅ Registered degrade rule data source: dataId={}, group={}", degradeRuleDataId, nacosGroupId);

        logger.info("==============================================");
        logger.info("Token Server Application Rules loaded successfully!");
        logger.info("==============================================");
    }
}
