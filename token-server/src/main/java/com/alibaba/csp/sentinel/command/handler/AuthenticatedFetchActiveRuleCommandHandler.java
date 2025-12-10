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

import com.alibaba.csp.sentinel.command.CommandHandler;
import com.alibaba.csp.sentinel.command.CommandRequest;
import com.alibaba.csp.sentinel.command.CommandResponse;
import com.alibaba.csp.sentinel.command.annotation.CommandMapping;
import com.alibaba.csp.sentinel.slots.block.authority.AuthorityRuleManager;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRuleManager;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import com.alibaba.csp.sentinel.slots.system.SystemRuleManager;
import com.alibaba.csp.sentinel.util.StringUtil;
import com.alibaba.fastjson.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 带鉴权的规则查询 Handler
 * 
 * 通过 SPI 机制替换官方的 FetchActiveRuleCommandHandler
 * 在查询规则前验证 app_secret 参数
 * 
 * 注意：认证失败返回 HTTP 400 状态码（由 Sentinel CommandResponse.ofFailure 固定）
 * 虽然 HTTP 标准建议使用 401 Unauthorized，但 Sentinel 的 SimpleHttpCommandCenter
 * 对所有失败响应统一返回 400，我们无法自定义状态码（除非修改 Sentinel 源码）
 * 
 * @author ygqygq2
 */
@CommandMapping(name = "getRules", desc = "get all active rules by type with authentication, request param: type={ruleType}, app_secret={secret}")
public class AuthenticatedFetchActiveRuleCommandHandler implements CommandHandler<String> {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticatedFetchActiveRuleCommandHandler.class);
    
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
                logger.warn("[Auth] getRules rejected: missing app_secret");
                return CommandResponse.ofFailure(new IllegalArgumentException(
                    "app_secret is required when authentication is enabled"));
            }
            
            if (!EXPECTED_SECRET.equals(appSecret)) {
                logger.warn("[Auth] getRules rejected: invalid app_secret");
                return CommandResponse.ofFailure(new IllegalArgumentException("Invalid app_secret"));
            }
            
            logger.debug("[Auth] getRules authenticated successfully");
        }
        
        // 鉴权通过，执行原逻辑
        String type = request.getParam("type");
        if ("flow".equalsIgnoreCase(type)) {
            return CommandResponse.ofSuccess(JSON.toJSONString(FlowRuleManager.getRules()));
        } else if ("degrade".equalsIgnoreCase(type)) {
            return CommandResponse.ofSuccess(JSON.toJSONString(DegradeRuleManager.getRules()));
        } else if ("authority".equalsIgnoreCase(type)) {
            return CommandResponse.ofSuccess(JSON.toJSONString(AuthorityRuleManager.getRules()));
        } else if ("system".equalsIgnoreCase(type)) {
            return CommandResponse.ofSuccess(JSON.toJSONString(SystemRuleManager.getRules()));
        } else {
            return CommandResponse.ofFailure(new IllegalArgumentException("invalid type"));
        }
    }
}
