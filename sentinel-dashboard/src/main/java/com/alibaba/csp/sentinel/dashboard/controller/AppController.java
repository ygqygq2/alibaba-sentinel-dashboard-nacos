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

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.alibaba.csp.sentinel.dashboard.discovery.AppInfo;
import com.alibaba.csp.sentinel.dashboard.discovery.AppManagement;
import com.alibaba.csp.sentinel.dashboard.discovery.InstanceInfo;
import com.alibaba.csp.sentinel.dashboard.domain.Result;
import com.alibaba.csp.sentinel.dashboard.domain.vo.InstanceInfoVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Carpenter Lee
 */
@RestController
@RequestMapping(value = "/app")
public class AppController {

    @Autowired
    private AppManagement appManagement;

    @GetMapping("/names.json")
    public Result<List<String>> queryApps(HttpServletRequest request) {
        return Result.ofSuccess(appManagement.getAppNames());
    }

    @GetMapping("/briefinfos.json")
    public Result<List<AppInfo>> queryAppInfos(HttpServletRequest request) {
        List<AppInfo> list = new ArrayList<>(appManagement.getBriefApps());
        Collections.sort(list, Comparator.comparing(AppInfo::getApp));
        return Result.ofSuccess(list);
    }

    @GetMapping(value = "/{app}/instances.json")
    public Result<List<InstanceInfoVo>> getInstancesByApp(@PathVariable("app") String app) {
        AppInfo appInfo = appManagement.getDetailApp(app);
        if (appInfo == null) {
            return Result.ofSuccess(null);
        }
        List<InstanceInfo> list = new ArrayList<>(appInfo.getInstances());
        Collections.sort(list, Comparator.comparing(InstanceInfo::getApp).thenComparing(InstanceInfo::getIp).thenComparingInt(InstanceInfo::getPort));
        return Result.ofSuccess(InstanceInfoVo.fromInstanceInfoList(list));
    }
    
    @RequestMapping(value = "/{app}/instance/remove.json")
    public Result<String> removeInstanceById(
            @PathVariable("app") String app,
            @RequestParam(name = "ip") String ip,
            @RequestParam(name = "port") int port) {
        AppInfo appInfo = appManagement.getDetailApp(app);
        if (appInfo == null) {
            return Result.ofSuccess(null);
        }
        if (appManagement.removeInstance(app, ip, port)) {
            return Result.ofSuccessMsg("success");
        } else {
            return Result.ofFail(1, "remove failed");
        }
    }
}
