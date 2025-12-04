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
package com.alibaba.csp.sentinel.dashboard.controller;

import com.alibaba.csp.sentinel.dashboard.discovery.AppManagement;
import com.alibaba.csp.sentinel.util.StringUtil;

import com.alibaba.csp.sentinel.dashboard.discovery.MachineInfo;
import com.alibaba.csp.sentinel.dashboard.domain.Result;

import org.apache.http.conn.util.InetAddressUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.regex.Pattern;

@Controller
@RequestMapping(value = "/registry", produces = MediaType.APPLICATION_JSON_VALUE)
public class MachineRegistryController {

    private final Logger logger = LoggerFactory.getLogger(MachineRegistryController.class);

    /**
     * 域名/服务名正则：支持 K8s 服务名格式，如 service-name, service-name.namespace, service-name.namespace.svc.cluster.local
     */
    private static final Pattern HOSTNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?)*$"
    );

    @Autowired
    private AppManagement appManagement;

    /**
     * 校验是否为有效的 IP 地址或域名/服务名
     * 支持：IPv4, IPv6, 域名, K8s 服务名
     */
    private boolean isValidIpOrHostname(String address) {
        if (StringUtil.isBlank(address)) {
            return false;
        }
        // 检查是否为有效 IP
        if (InetAddressUtils.isIPv4Address(address) || InetAddressUtils.isIPv6Address(address)) {
            return true;
        }
        // 检查是否为有效域名/服务名
        return HOSTNAME_PATTERN.matcher(address).matches();
    }

    @ResponseBody
    @RequestMapping("/machine")
    public Result<?> receiveHeartBeat(String app,
                                      @RequestParam(value = "app_type", required = false, defaultValue = "0")
                                          Integer appType, Long version, String v, String hostname, String ip,
                                      Integer port) {
        if (StringUtil.isBlank(app) || app.length() > 256) {
            return Result.ofFail(-1, "invalid appName");
        }
        if (StringUtil.isBlank(ip) || ip.length() > 128) {
            return Result.ofFail(-1, "invalid ip: " + ip);
        }
        // 支持 IP 和域名/服务名
        if (!isValidIpOrHostname(ip)) {
            return Result.ofFail(-1, "invalid ip or hostname: " + ip);
        }
        if (port == null || port < -1) {
            return Result.ofFail(-1, "invalid port");
        }
        if (hostname != null && hostname.length() > 256) {
            return Result.ofFail(-1, "hostname too long");
        }
        if (port == -1) {
            logger.warn("Receive heartbeat from " + ip + " but port not set yet");
            return Result.ofFail(-1, "your port not set yet");
        }
        String sentinelVersion = StringUtil.isBlank(v) ? "unknown" : v;

        version = version == null ? System.currentTimeMillis() : version;
        try {
            MachineInfo machineInfo = new MachineInfo();
            machineInfo.setApp(app);
            machineInfo.setAppType(appType);
            machineInfo.setHostname(hostname);
            machineInfo.setIp(ip);
            machineInfo.setPort(port);
            machineInfo.setHeartbeatVersion(version);
            machineInfo.setLastHeartbeat(System.currentTimeMillis());
            machineInfo.setVersion(sentinelVersion);
            appManagement.addMachine(machineInfo);
            return Result.ofSuccessMsg("success");
        } catch (Exception e) {
            logger.error("Receive heartbeat error", e);
            return Result.ofFail(-1, e.getMessage());
        }
    }
}
