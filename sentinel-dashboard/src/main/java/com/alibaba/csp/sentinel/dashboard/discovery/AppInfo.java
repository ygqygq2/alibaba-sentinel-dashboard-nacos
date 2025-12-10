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

import java.util.Comparator;
import java.util.HashSet;
import java.util.Optional;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.alibaba.csp.sentinel.dashboard.config.DashboardConfig;

public class AppInfo {

    private String app = "";

    private Integer appType = 0;

    private Set<InstanceInfo> instances = ConcurrentHashMap.newKeySet();

    public AppInfo() {}

    public AppInfo(String app) {
        this.app = app;
    }

    public AppInfo(String app, Integer appType) {
        this.app = app;
        this.appType = appType;
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

    /**
     * Get the current instances.
     *
     * @return a new copy of the current instances.
     */
    public Set<InstanceInfo> getInstances() {
        return new HashSet<>(instances);
    }

    @Override
    public String toString() {
        return "AppInfo{" + "app='" + app + ", instances=" + instances + '}';
    }

    public boolean addInstance(InstanceInfo instanceInfo) {
        instances.remove(instanceInfo);
        return instances.add(instanceInfo);
    }

    public synchronized boolean removeInstance(String ip, int port) {
        Iterator<InstanceInfo> it = instances.iterator();
        while (it.hasNext()) {
            InstanceInfo instance = it.next();
            if (instance.getIp().equals(ip) && instance.getPort() == port) {
                it.remove();
                return true;
            }
        }
        return false;
    }

    public Optional<InstanceInfo> getInstance(String ip, int port) {
        return instances.stream()
            .filter(e -> e.getIp().equals(ip) && e.getPort().equals(port))
            .findFirst();
    }

    public Optional<InstanceInfo> getInstance(String ip) {
        return instances.stream()
            .filter(e -> e.getIp().equals(ip))
            .findFirst();
    }

    private boolean heartbeatJudge(final int threshold) {
        if (instances.size() == 0) {
            return false;
        }
        if (threshold > 0) {
            long healthyCount = instances.stream()
                .filter(InstanceInfo::isHealthy)
                .count();
            if (healthyCount == 0) {
                // No healthy instances.
                return instances.stream()
                    .max(Comparator.comparingLong(InstanceInfo::getLastHeartbeat))
                    .map(e -> System.currentTimeMillis() - e.getLastHeartbeat() < threshold)
                    .orElse(false);
            }
        }
        return true;
    }

    /**
     * Check whether current application has no healthy instances and should not be displayed.
     *
     * @return true if the application should be displayed in the sidebar, otherwise false
     */
    public boolean isShown() {
        return heartbeatJudge(DashboardConfig.getHideAppNoInstanceMillis());
    }

    /**
     * Check whether current application has no healthy instances and should be removed.
     *
     * @return true if the application is dead and should be removed, otherwise false
     */
    public boolean isDead() {
        return !heartbeatJudge(DashboardConfig.getRemoveAppNoInstanceMillis());
    }
}
