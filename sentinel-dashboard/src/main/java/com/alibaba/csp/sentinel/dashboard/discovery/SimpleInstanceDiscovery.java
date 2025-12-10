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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import com.alibaba.csp.sentinel.util.AssertUtil;

import org.springframework.stereotype.Component;

/**
 * @author leyou
 */
@Component
public class SimpleInstanceDiscovery implements InstanceDiscovery {

    private final ConcurrentMap<String, AppInfo> apps = new ConcurrentHashMap<>();

    @Override
    public long addInstance(InstanceInfo instanceInfo) {
        AssertUtil.notNull(instanceInfo, "instanceInfo cannot be null");
        AppInfo appInfo = apps.computeIfAbsent(instanceInfo.getApp(), o -> new AppInfo(instanceInfo.getApp(), instanceInfo.getAppType()));
        appInfo.addInstance(instanceInfo);
        return 1;
    }

    @Override
    public boolean removeInstance(String app, String ip, int port) {
        AssertUtil.assertNotBlank(app, "app name cannot be blank");
        AppInfo appInfo = apps.get(app);
        if (appInfo != null) {
            return appInfo.removeInstance(ip, port);
        }
        return false;
    }

    @Override
    public List<String> getAppNames() {
        return new ArrayList<>(apps.keySet());
    }

    @Override
    public AppInfo getDetailApp(String app) {
        AssertUtil.assertNotBlank(app, "app name cannot be blank");
        return apps.get(app);
    }

    @Override
    public Set<AppInfo> getBriefApps() {
        return new HashSet<>(apps.values());
    }

    @Override
    public void removeApp(String app) {
        AssertUtil.assertNotBlank(app, "app name cannot be blank");
        apps.remove(app);
    }

}
