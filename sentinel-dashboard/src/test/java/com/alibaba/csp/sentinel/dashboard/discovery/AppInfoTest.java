/*
 * Copyright 1999-2019 Alibaba Group Holding Ltd.
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

import java.util.ConcurrentModificationException;
import java.util.Set;

import org.junit.Test;

import com.alibaba.csp.sentinel.dashboard.config.DashboardConfig;

import static org.junit.Assert.*;

public class AppInfoTest {

    @Test
    public void testConcurrentGetInstances() throws Exception {
        AppInfo appInfo = new AppInfo("testApp");
        appInfo.addInstance(genInstanceInfo("hostName1", "10.18.129.91"));
        appInfo.addInstance(genInstanceInfo("hostName2", "10.18.129.92"));
        Set<InstanceInfo> instances = appInfo.getInstances();
        new Thread(() -> {
            try {
                for (InstanceInfo m : instances) {
                    System.out.println(m);
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                    }
                }
            } catch (ConcurrentModificationException e) {
                e.printStackTrace();
                fail();
            }

        }).start();
        Thread.sleep(100);
        try {
            appInfo.addInstance(genInstanceInfo("hostName3", "10.18.129.93"));
        } catch (ConcurrentModificationException e) {
            e.printStackTrace();
            fail();
        }
        Thread.sleep(1000);
    }

    private InstanceInfo genInstanceInfo(String hostName, String ip) {
        InstanceInfo instance = new InstanceInfo();
        instance.setApp("testApp");
        instance.setHostname(hostName);
        instance.setIp(ip);
        instance.setPort(8719);
        instance.setVersion(String.valueOf(System.currentTimeMillis()));
        return instance;
    }

    @Test
    public void addRemoveInstanceTest() {
        AppInfo appInfo = new AppInfo("default");
        assertEquals("default", appInfo.getApp());
        assertEquals(0, appInfo.getInstances().size());
        //add one
        {
            InstanceInfo instanceInfo = new InstanceInfo();
            instanceInfo.setApp("default");
            instanceInfo.setHostname("bogon");
            instanceInfo.setIp("127.0.0.1");
            instanceInfo.setPort(3389);
            instanceInfo.setLastHeartbeat(System.currentTimeMillis());
            instanceInfo.setHeartbeatVersion(1);
            instanceInfo.setVersion("0.4.1");
            appInfo.addInstance(instanceInfo);
        }
        assertEquals(1, appInfo.getInstances().size());
        //add duplicated one
        {
            InstanceInfo instanceInfo = new InstanceInfo();
            instanceInfo.setApp("default");
            instanceInfo.setHostname("bogon");
            instanceInfo.setIp("127.0.0.1");
            instanceInfo.setPort(3389);
            instanceInfo.setLastHeartbeat(System.currentTimeMillis());
            instanceInfo.setHeartbeatVersion(1);
            instanceInfo.setVersion("0.4.2");
            appInfo.addInstance(instanceInfo);
        }
        assertEquals(1, appInfo.getInstances().size());
        //add different one
        {
            InstanceInfo instanceInfo = new InstanceInfo();
            instanceInfo.setApp("default");
            instanceInfo.setHostname("bogon");
            instanceInfo.setIp("127.0.0.1");
            instanceInfo.setPort(3390);
            instanceInfo.setLastHeartbeat(System.currentTimeMillis());
            instanceInfo.setHeartbeatVersion(1);
            instanceInfo.setVersion("0.4.3");
            appInfo.addInstance(instanceInfo);
        }
        assertEquals(2, appInfo.getInstances().size());
        appInfo.removeInstance("127.0.0.1", 3389);
        assertEquals(1, appInfo.getInstances().size());
        appInfo.removeInstance("127.0.0.1", 3390);
        assertEquals(0, appInfo.getInstances().size());
    }

    @Test
    public void testHealthyAndDead() {
        System.setProperty(DashboardConfig.CONFIG_HIDE_APP_NO_INSTANCE_MILLIS, "60000");
        System.setProperty(DashboardConfig.CONFIG_REMOVE_APP_NO_INSTANCE_MILLIS, "600000");
        DashboardConfig.clearCache();
        String appName = "default";
        AppInfo appInfo = new AppInfo();
        appInfo.setApp(appName);
        {
            InstanceInfo instanceInfo = InstanceInfo.of(appName, "127.0.0.1", 8801);
            instanceInfo.setHeartbeatVersion(1);
            instanceInfo.setLastHeartbeat(System.currentTimeMillis());
            appInfo.addInstance(instanceInfo);
        }
        assertTrue(appInfo.isShown());
        assertFalse(appInfo.isDead());

        {
            InstanceInfo instanceInfo = InstanceInfo.of(appName, "127.0.0.1", 8801);
            instanceInfo.setHeartbeatVersion(1);
            instanceInfo.setLastHeartbeat(System.currentTimeMillis() - 70000);
            appInfo.addInstance(instanceInfo);
        }
        assertFalse(appInfo.isShown());
        assertFalse(appInfo.isDead());

        {
            InstanceInfo instanceInfo = InstanceInfo.of(appName, "127.0.0.1", 8801);
            instanceInfo.setHeartbeatVersion(1);
            instanceInfo.setLastHeartbeat(System.currentTimeMillis() - 700000);
            appInfo.addInstance(instanceInfo);
        }
        assertFalse(appInfo.isShown());
        assertTrue(appInfo.isDead());
    }

}
