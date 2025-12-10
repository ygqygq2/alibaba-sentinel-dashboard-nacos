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
package com.alibaba.csp.sentinel.dashboard.discovery;

import java.util.Objects;

import com.alibaba.csp.sentinel.dashboard.config.DashboardConfig;
import com.alibaba.csp.sentinel.util.StringUtil;

public class InstanceInfo implements Comparable<InstanceInfo> {

    private String app = "";
    private Integer appType = 0;
    private String hostname = "";
    private String ip = "";
    /**
     * Domain name for the instance (optional, e.g., service.namespace.svc.cluster.local)
     */
    private String domain = "";
    /**
     * Custom name for the instance (optional, e.g., StatefulSet pod name like "token-server-0")
     * Priority: name > domain > ip
     */
    private String name = "";
    private Integer port = -1;
    private long lastHeartbeat;
    private long heartbeatVersion;

    /**
     * Indicates the version of Sentinel client (since 0.2.0).
     */
    private String version;

    public static InstanceInfo of(String app, String ip, Integer port) {
        InstanceInfo instanceInfo = new InstanceInfo();
        instanceInfo.setApp(app);;
        instanceInfo.setIp(ip);
        instanceInfo.setPort(port);
        return instanceInfo;
    }

    /**
     * Get the address for communication (priority: name > domain > ip)
     */
    public String getAddress() {
        if (!StringUtil.isEmpty(name)) {
            return name;
        }
        if (!StringUtil.isEmpty(domain)) {
            return domain;
        }
        return ip;
    }

    /**
     * Get the full address with port (e.g., "token-server-0:8719" or "10.0.0.1:8719")
     */
    public String toHostPort() {
        return getAddress() + ":" + port;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getApp() {
        return app;
    }

    public void setApp(String app) {
        this.app = app;
    }

    public Integer getAppType() {
        return appType;
    }

    public void setAppType(Integer appType) {
        this.appType = appType;
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

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getHeartbeatVersion() {
        return heartbeatVersion;
    }
    
    public void setHeartbeatVersion(long heartbeatVersion) {
        this.heartbeatVersion = heartbeatVersion;
    }

    public String getVersion() {
        return version;
    }

    public InstanceInfo setVersion(String version) {
        this.version = version;
        return this;
    }
    
    public boolean isHealthy() {
        long delta = System.currentTimeMillis() - lastHeartbeat;
        return delta < DashboardConfig.getUnhealthyInstanceMillis();
    }
    
    /**
     * whether dead should be removed
     * 
     * @return
     */
    public boolean isDead() {
        if (DashboardConfig.getAutoRemoveInstanceMillis() > 0) {
            long delta = System.currentTimeMillis() - lastHeartbeat;
            return delta > DashboardConfig.getAutoRemoveInstanceMillis();
        }
        return false;
    }
    
    public long getLastHeartbeat() {
        return lastHeartbeat;
    }
    
    public void setLastHeartbeat(long lastHeartbeat) {
        this.lastHeartbeat = lastHeartbeat;
    }

    @Override
    public int compareTo(InstanceInfo o) {
        if (this == o) {
            return 0;
        }
        if (!port.equals(o.getPort())) {
            return port.compareTo(o.getPort());
        }
        if (!StringUtil.equals(app, o.getApp())) {
            return app.compareToIgnoreCase(o.getApp());
        }
        return ip.compareToIgnoreCase(o.getIp());
    }

    @Override
    public String toString() {
        return new StringBuilder("InstanceInfo {")
            .append("app='").append(app).append('\'')
            .append(",appType='").append(appType).append('\'')
            .append(", hostname='").append(hostname).append('\'')
            .append(", ip='").append(ip).append('\'')
            .append(", domain='").append(domain).append('\'')
            .append(", name='").append(name).append('\'')
            .append(", port=").append(port)
            .append(", heartbeatVersion=").append(heartbeatVersion)
            .append(", lastHeartbeat=").append(lastHeartbeat)
            .append(", version='").append(version).append('\'')
            .append(", healthy=").append(isHealthy())
            .append('}').toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) { return true; }
        if (!(o instanceof InstanceInfo)) { return false; }
        InstanceInfo that = (InstanceInfo)o;
        // Use address for comparison to support name/domain/ip
        return Objects.equals(app, that.app) &&
            Objects.equals(getAddress(), that.getAddress()) &&
            Objects.equals(port, that.port);
    }

    @Override
    public int hashCode() {
        return Objects.hash(app, getAddress(), port);
    }

    /**
     * Information for log
     *
     * @return
     */
    public String toLogString() {
        return app + "|" + ip + "|" + port + "|" + version;
    }
}
