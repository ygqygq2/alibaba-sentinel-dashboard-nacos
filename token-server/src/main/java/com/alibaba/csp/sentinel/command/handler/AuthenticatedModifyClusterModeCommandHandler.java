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

import com.alibaba.csp.sentinel.cluster.ClusterStateManager;
import com.alibaba.csp.sentinel.cluster.client.TokenClientProvider;
import com.alibaba.csp.sentinel.cluster.server.EmbeddedClusterTokenServerProvider;
import com.alibaba.csp.sentinel.command.CommandHandler;
import com.alibaba.csp.sentinel.command.CommandRequest;
import com.alibaba.csp.sentinel.command.CommandResponse;
import com.alibaba.csp.sentinel.command.annotation.CommandMapping;
import com.alibaba.csp.sentinel.log.RecordLog;
import com.alibaba.csp.sentinel.util.StringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 带鉴权的集群模式修改 Handler
 * 
 * 通过反射注册替换官方的 ModifyClusterModeCommandHandler
 * 在修改集群模式前验证 app_secret 参数
 * 
 * 注意：认证失败返回 HTTP 400 状态码（由 Sentinel CommandResponse.ofFailure 固定）
 * 虽然 HTTP 标准建议使用 401 Unauthorized，但 Sentinel 的 SimpleHttpCommandCenter
 * 对所有失败响应统一返回 400,我们无法自定义状态码（除非修改 Sentinel 源码）
 * 
 * @author ygqygq2
 */
@CommandMapping(name = "setClusterMode", desc = "set cluster mode with authentication, accept param: mode={0|1}, app_secret={secret}")
public class AuthenticatedModifyClusterModeCommandHandler implements CommandHandler<String> {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticatedModifyClusterModeCommandHandler.class);
    
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
                logger.warn("[Auth] setClusterMode rejected: missing app_secret");
                return CommandResponse.ofFailure(new IllegalArgumentException(
                    "app_secret is required when authentication is enabled"));
            }
            
            if (!EXPECTED_SECRET.equals(appSecret)) {
                logger.warn("[Auth] setClusterMode rejected: invalid app_secret");
                return CommandResponse.ofFailure(new IllegalArgumentException("Invalid app_secret"));
            }
            
            logger.debug("[Auth] setClusterMode authenticated successfully");
        }
        
        // 鉴权通过，执行原逻辑
        try {
            int mode = Integer.valueOf(request.getParam("mode"));
            if (mode == ClusterStateManager.CLUSTER_CLIENT && !TokenClientProvider.isClientSpiAvailable()) {
                return CommandResponse.ofFailure(new IllegalStateException("token client mode not available: no SPI found"));
            }
            if (mode == ClusterStateManager.CLUSTER_SERVER && !isClusterServerSpiAvailable()) {
                return CommandResponse.ofFailure(new IllegalStateException("token server mode not available: no SPI found"));
            }
            RecordLog.info("[ModifyClusterModeCommandHandler] Modifying cluster mode to: {}", mode);

            ClusterStateManager.applyState(mode);
            return CommandResponse.ofSuccess("success");
        } catch (NumberFormatException ex) {
            return CommandResponse.ofFailure(new IllegalArgumentException("invalid parameter"));
        } catch (Exception ex) {
            return CommandResponse.ofFailure(ex);
        }
    }

    private boolean isClusterServerSpiAvailable() {
        return EmbeddedClusterTokenServerProvider.isServerSpiAvailable();
    }
}
