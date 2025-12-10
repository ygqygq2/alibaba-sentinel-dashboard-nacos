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
package com.alibaba.csp.sentinel.dashboard.domain.vo;

import java.util.ArrayList;
import java.util.List;

import com.alibaba.csp.sentinel.dashboard.discovery.InstanceInfo;

/**
 * @author leyou
 */
public class InstanceInfoVo {

    private String app;
    private String hostname;
    private String ip;
    private int port;
    private long heartbeatVersion;
    private long lastHeartbeat;
    private boolean healthy;

    private String version;

    public static List<InstanceInfoVo> fromInstanceInfoList(List<InstanceInfo> instances) {
        List<InstanceInfoVo> list = new ArrayList<>();
        for (InstanceInfo instance : instances) {
            list.add(fromInstanceInfo(instance));
        }
        return list;
    }

    public static InstanceInfoVo fromInstanceInfo(InstanceInfo instance) {
        InstanceInfoVo vo = new InstanceInfoVo();
        vo.setApp(instance.getApp());
        vo.setHostname(instance.getHostname());
        vo.setIp(instance.getIp());
        vo.setPort(instance.getPort());
        vo.setLastHeartbeat(instance.getLastHeartbeat());
        vo.setHeartbeatVersion(instance.getHeartbeatVersion());
        vo.setVersion(instance.getVersion());
        vo.setHealthy(instance.isHealthy());
        return vo;
    }

    public String getApp() {
        return app;
    }

    public void setApp(String app) {
        this.app = app;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public long getLastHeartbeat() {
        return lastHeartbeat;
    }
    
    public void setLastHeartbeat(long lastHeartbeat) {
        this.lastHeartbeat = lastHeartbeat;
    }
    
    public void setHeartbeatVersion(long heartbeatVersion) {
        this.heartbeatVersion = heartbeatVersion;
    }
    
    public long getHeartbeatVersion() {
        return heartbeatVersion;
    }

    public String getVersion() {
        return version;
    }

    public InstanceInfoVo setVersion(String version) {
        this.version = version;
        return this;
    }

    public boolean isHealthy() {
        return healthy;
    }

    public void setHealthy(boolean healthy) {
        this.healthy = healthy;
    }
}
