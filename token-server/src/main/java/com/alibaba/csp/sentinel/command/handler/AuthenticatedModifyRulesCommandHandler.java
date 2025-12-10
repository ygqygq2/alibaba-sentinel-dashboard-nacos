/*
 * Copyright 1999-2018 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.alibaba.csp.sentinel.command.handler;

import java.net.URLDecoder;
import java.util.List;

import com.alibaba.csp.sentinel.command.CommandHandler;
import com.alibaba.csp.sentinel.command.CommandRequest;
import com.alibaba.csp.sentinel.command.CommandResponse;
import com.alibaba.csp.sentinel.command.annotation.CommandMapping;
import com.alibaba.csp.sentinel.datasource.WritableDataSource;
import com.alibaba.csp.sentinel.log.RecordLog;
import com.alibaba.csp.sentinel.util.StringUtil;
import com.alibaba.csp.sentinel.util.VersionUtil;
import com.alibaba.csp.sentinel.slots.block.authority.AuthorityRule;
import com.alibaba.csp.sentinel.slots.block.authority.AuthorityRuleManager;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRule;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRuleManager;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import com.alibaba.csp.sentinel.slots.system.SystemRuleManager;
import com.alibaba.csp.sentinel.slots.system.SystemRule;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.alibaba.csp.sentinel.transport.util.WritableDataSourceRegistry.*;

/**
 * 带鉴权的规则修改 Handler
 * 
 * 通过 SPI 机制替换官方的 ModifyRulesCommandHandler
 * 在修改规则前验证 app_secret 参数
 * 
 * 注意：认证失败返回 HTTP 400 状态码（由 Sentinel CommandResponse.ofFailure 固定）
 * 虽然 HTTP 标准建议使用 401 Unauthorized，但 Sentinel 的 SimpleHttpCommandCenter
 * 对所有失败响应统一返回 400，我们无法自定义状态码（除非修改 Sentinel 源码）
 * 
 * @author ygqygq2
 */
@CommandMapping(name = "setRules", desc = "modify the rules with authentication, accept param: type={ruleType}&data={ruleJson}&app_secret={secret}")
public class AuthenticatedModifyRulesCommandHandler implements CommandHandler<String> {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthenticatedModifyRulesCommandHandler.class);
    private static final int FASTJSON_MINIMAL_VER = 0x01020C00;
    
    /**
     * 期望的 app_secret，从 JVM 参数读取：-Dcsp.sentinel.app.secret=xxx
     */
    private static final String EXPECTED_SECRET = System.getProperty("csp.sentinel.app.secret");
    
    /**
     * 是否启用鉴权（如果未配置 app_secret，则不启用）
     */
    private static final boolean AUTH_ENABLED = StringUtil.isNotBlank(EXPECTED_SECRET);

    @Override
    public CommandResponse<String> handle(CommandRequest request) {
        // 验证 app_secret（如果启用了鉴权）
        if (AUTH_ENABLED) {
            String appSecret = request.getParam("app_secret");
            
            if (StringUtil.isBlank(appSecret)) {
                logger.warn("[Auth] setRules rejected: missing app_secret");
                return CommandResponse.ofFailure(new IllegalArgumentException(
                    "app_secret is required when authentication is enabled"));
            }
            
            if (!EXPECTED_SECRET.equals(appSecret)) {
                logger.warn("[Auth] setRules rejected: invalid app_secret");
                return CommandResponse.ofFailure(new IllegalArgumentException("Invalid app_secret"));
            }
            
            logger.debug("[Auth] setRules authenticated successfully");
        }
        
        // 鉴权通过，执行原逻辑
        // XXX from 1.7.2, force to fail when fastjson is older than 1.2.12
        if (VersionUtil.fromVersionString(JSON.VERSION) < FASTJSON_MINIMAL_VER) {
            return CommandResponse.ofFailure(new RuntimeException("The \"fastjson-" + JSON.VERSION
                    + "\" introduced in application is too old, you need fastjson-1.2.12 at least."));
        }
        
        String type = request.getParam("type");
        String data = request.getParam("data");
        if (StringUtil.isNotEmpty(data)) {
            try {
                data = URLDecoder.decode(data, "utf-8");
            } catch (Exception e) {
                RecordLog.info("Decode rule data error", e);
                return CommandResponse.ofFailure(e, "decode rule data error");
            }
        }

        RecordLog.info("Receiving rule change (type: {}): {}", type, data);

        String result = "success";

        if (FLOW_RULE_TYPE.equalsIgnoreCase(type)) {
            List<FlowRule> flowRules = JSONArray.parseArray(data, FlowRule.class);
            FlowRuleManager.loadRules(flowRules);
            if (!writeToDataSource(getFlowDataSource(), flowRules)) {
                result = WRITE_DS_FAILURE_MSG;
            }
            return CommandResponse.ofSuccess(result);
        } else if (AUTHORITY_RULE_TYPE.equalsIgnoreCase(type)) {
            List<AuthorityRule> rules = JSONArray.parseArray(data, AuthorityRule.class);
            AuthorityRuleManager.loadRules(rules);
            if (!writeToDataSource(getAuthorityDataSource(), rules)) {
                result = WRITE_DS_FAILURE_MSG;
            }
            return CommandResponse.ofSuccess(result);
        } else if (DEGRADE_RULE_TYPE.equalsIgnoreCase(type)) {
            List<DegradeRule> rules = JSONArray.parseArray(data, DegradeRule.class);
            DegradeRuleManager.loadRules(rules);
            if (!writeToDataSource(getDegradeDataSource(), rules)) {
                result = WRITE_DS_FAILURE_MSG;
            }
            return CommandResponse.ofSuccess(result);
        } else if (SYSTEM_RULE_TYPE.equalsIgnoreCase(type)) {
            List<SystemRule> rules = JSONArray.parseArray(data, SystemRule.class);
            SystemRuleManager.loadRules(rules);
            if (!writeToDataSource(getSystemSource(), rules)) {
                result = WRITE_DS_FAILURE_MSG;
            }
            return CommandResponse.ofSuccess(result);
        }
        return CommandResponse.ofFailure(new IllegalArgumentException("invalid type"));
    }

    private <T> boolean writeToDataSource(WritableDataSource<T> dataSource, T value) {
        if (dataSource != null) {
            try {
                dataSource.write(value);
            } catch (Exception e) {
                RecordLog.warn("Write data source failed", e);
                return false;
            }
        }
        return true;
    }

    private static final String WRITE_DS_FAILURE_MSG = "partial success (write data source failed)";
    private static final String FLOW_RULE_TYPE = "flow";
    private static final String DEGRADE_RULE_TYPE = "degrade";
    private static final String SYSTEM_RULE_TYPE = "system";
    private static final String AUTHORITY_RULE_TYPE = "authority";
}
