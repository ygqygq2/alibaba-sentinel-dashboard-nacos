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
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import com.alibaba.csp.sentinel.dashboard.domain.Result;
import com.alibaba.csp.sentinel.dashboard.repository.metric.MetricsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.csp.sentinel.util.StringUtil;

import com.alibaba.csp.sentinel.dashboard.datasource.entity.MetricEntity;
import com.alibaba.csp.sentinel.dashboard.domain.vo.MetricVo;

/**
 * @author leyou
 */
@Controller
@RequestMapping(value = "/metric", produces = MediaType.APPLICATION_JSON_VALUE)
public class MetricController {

    private static Logger logger = LoggerFactory.getLogger(MetricController.class);

    private static final long maxQueryIntervalMs = 1000 * 60 * 60;

    @Autowired
    private MetricsRepository<MetricEntity> metricStore;

    @ResponseBody
    @RequestMapping("/queryTopResourceMetric.json")
    public Result<?> queryTopResourceMetric(final String app,
                                            Integer pageIndex,
                                            Integer pageSize,
                                            Boolean desc,
                                            Long startTime, Long endTime, String searchKey) {
        if (StringUtil.isEmpty(app)) {
            return Result.ofFail(-1, "app can't be null or empty");
        }
        if (pageIndex == null || pageIndex <= 0) {
            pageIndex = 1;
        }
        if (pageSize == null) {
            pageSize = 6;
        }
        if (pageSize >= 20) {
            pageSize = 20;
        }
        if (desc == null) {
            desc = true;
        }
        if (endTime == null) {
            endTime = System.currentTimeMillis();
        }
        if (startTime == null) {
            startTime = endTime - 1000 * 60 * 5;
        }
        if (endTime - startTime > maxQueryIntervalMs) {
            return Result.ofFail(-1, "time intervalMs is too big, must <= 1h");
        }
        List<String> resources = metricStore.listResourcesOfApp(app);
        logger.debug("queryTopResourceMetric(), resources.size()={}", resources.size());

        if (resources == null || resources.isEmpty()) {
            return Result.ofSuccess(null);
        }
        if (!desc) {
            Collections.reverse(resources);
        }
        if (StringUtil.isNotEmpty(searchKey)) {
            List<String> searched = new ArrayList<>();
            for (String resource : resources) {
                if (resource.contains(searchKey)) {
                    searched.add(resource);
                }
            }
            resources = searched;
        }
        int totalPage = (resources.size() + pageSize - 1) / pageSize;
        List<String> topResource = new ArrayList<>();
        if (pageIndex <= totalPage) {
            topResource = resources.subList((pageIndex - 1) * pageSize,
                Math.min(pageIndex * pageSize, resources.size()));
        }
        final Map<String, Iterable<MetricVo>> map = new ConcurrentHashMap<>();
        logger.debug("topResource={}", topResource);
        long time = System.currentTimeMillis();
        for (final String resource : topResource) {
            List<MetricEntity> entities = metricStore.queryByAppAndResourceBetween(
                app, resource, startTime, endTime);
            logger.debug("resource={}, entities.size()={}", resource, entities == null ? "null" : entities.size());
            List<MetricVo> vos = MetricVo.fromMetricEntities(entities, resource);
            Iterable<MetricVo> vosSorted = sortMetricVoAndDistinct(vos);
            map.put(resource, vosSorted);
        }
        logger.debug("queryTopResourceMetric() total query time={} ms", System.currentTimeMillis() - time);
        Map<String, Object> resultMap = new HashMap<>(16);
        resultMap.put("totalCount", resources.size());
        resultMap.put("totalPage", totalPage);
        resultMap.put("pageIndex", pageIndex);
        resultMap.put("pageSize", pageSize);

        Map<String, Iterable<MetricVo>> map2 = new LinkedHashMap<>();
        // order matters.
        for (String identity : topResource) {
            map2.put(identity, map.get(identity));
        }
        resultMap.put("metric", map2);
        return Result.ofSuccess(resultMap);
    }

    @ResponseBody
    @RequestMapping("/queryByAppAndResource.json")
    public Result<?> queryByAppAndResource(String app, String identity, Long startTime, Long endTime) {
        if (StringUtil.isEmpty(app)) {
            return Result.ofFail(-1, "app can't be null or empty");
        }
        if (StringUtil.isEmpty(identity)) {
            return Result.ofFail(-1, "identity can't be null or empty");
        }
        if (endTime == null) {
            endTime = System.currentTimeMillis();
        }
        if (startTime == null) {
            startTime = endTime - 1000 * 60;
        }
        if (endTime - startTime > maxQueryIntervalMs) {
            return Result.ofFail(-1, "time intervalMs is too big, must <= 1h");
        }
        List<MetricEntity> entities = metricStore.queryByAppAndResourceBetween(
            app, identity, startTime, endTime);
        List<MetricVo> vos = MetricVo.fromMetricEntities(entities, identity);
        return Result.ofSuccess(sortMetricVoAndDistinct(vos));
    }

    private Iterable<MetricVo> sortMetricVoAndDistinct(List<MetricVo> vos) {
        if (vos == null) {
            return null;
        }
        Map<Long, MetricVo> map = new TreeMap<>();
        for (MetricVo vo : vos) {
            MetricVo oldVo = map.get(vo.getTimestamp());
            if (oldVo == null || vo.getGmtCreate() > oldVo.getGmtCreate()) {
                map.put(vo.getTimestamp(), vo);
            }
        }
        return map.values();
    }

    /**
     * Query metrics with aggregated view (sum across all instances) or instance view.
     * 
     * @param app application name
     * @param viewMode "aggregate" (default) or "instance"
     * @param pageIndex page index
     * @param pageSize page size
     * @param desc sort descending
     * @param startTime start timestamp
     * @param endTime end timestamp
     * @param searchKey search keyword
     * @return metrics grouped by resource or instance
     */
    @ResponseBody
    @RequestMapping("/queryByViewMode.json")
    public Result<?> queryByViewMode(final String app,
                                     String viewMode,
                                     String ip,    // 实例 IP（实例视图使用）
                                     Integer port, // 实例端口（实例视图使用）
                                     Integer pageIndex,
                                     Integer pageSize,
                                     Boolean desc,
                                     Long startTime, Long endTime, String searchKey) {
        if (StringUtil.isEmpty(app)) {
            return Result.ofFail(-1, "app can't be null or empty");
        }
        if (pageIndex == null || pageIndex <= 0) {
            pageIndex = 1;
        }
        if (pageSize == null) {
            pageSize = 6;
        }
        if (pageSize >= 20) {
            pageSize = 20;
        }
        if (desc == null) {
            desc = true;
        }
        if (endTime == null) {
            endTime = System.currentTimeMillis();
        }
        if (startTime == null) {
            startTime = endTime - 1000 * 60 * 5;
        }
        if (endTime - startTime > maxQueryIntervalMs) {
            return Result.ofFail(-1, "time intervalMs is too big, must <= 1h");
        }
        
        // Default to aggregate view
        if (viewMode == null || viewMode.isEmpty()) {
            viewMode = "aggregate";
        }
        
        if ("instance".equals(viewMode)) {
            return queryByInstanceView(app, ip, port, pageIndex, pageSize, desc, startTime, endTime, searchKey);
        } else {
            return queryByAggregateView(app, pageIndex, pageSize, desc, startTime, endTime, searchKey);
        }
    }

    /**
     * Aggregate view: group by resource, sum metrics across all instances
     */
    private Result<?> queryByAggregateView(String app, int pageIndex, int pageSize, boolean desc,
                                          long startTime, long endTime, String searchKey) {
        List<String> resources = metricStore.listResourcesOfApp(app);
        if (resources == null || resources.isEmpty()) {
            return Result.ofSuccess(null);
        }
        
        if (!desc) {
            Collections.reverse(resources);
        }
        if (StringUtil.isNotEmpty(searchKey)) {
            List<String> searched = new ArrayList<>();
            for (String resource : resources) {
                if (resource.contains(searchKey)) {
                    searched.add(resource);
                }
            }
            resources = searched;
        }
        
        int totalPage = (resources.size() + pageSize - 1) / pageSize;
        List<String> topResource = new ArrayList<>();
        if (pageIndex <= totalPage) {
            topResource = resources.subList((pageIndex - 1) * pageSize,
                Math.min(pageIndex * pageSize, resources.size()));
        }
        
        final Map<String, Iterable<MetricVo>> map = new ConcurrentHashMap<>();
        for (final String resource : topResource) {
            List<MetricEntity> entities = metricStore.queryByAppAndResourceBetween(
                app, resource, startTime, endTime);
            
            // Aggregate metrics by timestamp
            Map<Long, MetricEntity> aggregated = new HashMap<>();
            for (MetricEntity entity : entities) {
                long timestamp = entity.getTimestamp().getTime();
                MetricEntity existing = aggregated.get(timestamp);
                if (existing == null) {
                    existing = new MetricEntity();
                    existing.setApp(app);
                    existing.setResource(resource);
                    existing.setTimestamp(entity.getTimestamp());
                    existing.setGmtCreate(entity.getTimestamp());
                    existing.setPassQps(0L);
                    existing.setBlockQps(0L);
                    existing.setSuccessQps(0L);
                    existing.setExceptionQps(0L);
                    existing.setRt(0.0);
                    existing.setCount(0);
                    aggregated.put(timestamp, existing);
                }
                existing.addPassQps(entity.getPassQps());
                existing.addBlockQps(entity.getBlockQps());
                existing.addExceptionQps(entity.getExceptionQps());
                existing.addRtAndSuccessQps(
                    entity.getSuccessQps() > 0 ? entity.getRt() / entity.getSuccessQps() : 0,
                    entity.getSuccessQps()
                );
                existing.addCount(1);
            }
            
            List<MetricVo> vos = MetricVo.fromMetricEntities(new ArrayList<>(aggregated.values()), resource);
            map.put(resource, sortMetricVoAndDistinct(vos));
        }
        
        Map<String, Object> resultMap = new HashMap<>(16);
        resultMap.put("totalCount", resources.size());
        resultMap.put("totalPage", totalPage);
        resultMap.put("pageIndex", pageIndex);
        resultMap.put("pageSize", pageSize);
        resultMap.put("viewMode", "aggregate");
        
        Map<String, Iterable<MetricVo>> orderedMap = new LinkedHashMap<>();
        for (String resource : topResource) {
            orderedMap.put(resource, map.get(resource));
        }
        resultMap.put("metric", orderedMap);
        return Result.ofSuccess(resultMap);
    }

    /**
     * Instance view: group by instance (ip:port), show each instance's metrics
     * 
     * @param ip   实例 IP（可选，指定则只返回该实例的数据）
     * @param port 实例端口（可选，与 ip 配合使用）
     */
    private Result<?> queryByInstanceView(String app, String ip, Integer port, int pageIndex, int pageSize, boolean desc,
                                         long startTime, long endTime, String searchKey) {
        List<MetricEntity> allEntities = metricStore.queryByAppBetween(app, startTime, endTime);
        if (allEntities == null || allEntities.isEmpty()) {
            return Result.ofSuccess(null);
        }
        
        // 如果指定了 ip 和 port，只保留该实例的数据
        if (ip != null && !ip.isEmpty() && port != null) {
            allEntities = allEntities.stream()
                .filter(e -> ip.equals(e.getIp()) && port.equals(e.getPort()))
                .collect(Collectors.toList());
        }
        
        if (allEntities.isEmpty()) {
            return Result.ofSuccess(null);
        }
        
        // Group by instance (ip:port)
        Map<String, List<MetricEntity>> instanceMap = new HashMap<>();
        for (MetricEntity entity : allEntities) {
            String instanceKey = entity.getIp() + ":" + entity.getPort();
            instanceMap.computeIfAbsent(instanceKey, k -> new ArrayList<>()).add(entity);
        }
        
        List<String> instances = new ArrayList<>(instanceMap.keySet());
        if (!desc) {
            Collections.reverse(instances);
        }
        
        if (StringUtil.isNotEmpty(searchKey)) {
            List<String> searched = new ArrayList<>();
            for (String instance : instances) {
                if (instance.contains(searchKey)) {
                    searched.add(instance);
                }
            }
            instances = searched;
        }
        
        int totalPage = (instances.size() + pageSize - 1) / pageSize;
        List<String> topInstances = new ArrayList<>();
        if (pageIndex <= totalPage) {
            topInstances = instances.subList((pageIndex - 1) * pageSize,
                Math.min(pageIndex * pageSize, instances.size()));
        }
        
        final Map<String, Map<String, Iterable<MetricVo>>> result = new LinkedHashMap<>();
        for (String instance : topInstances) {
            List<MetricEntity> instanceEntities = instanceMap.get(instance);
            
            // Group by resource for this instance
            Map<String, List<MetricEntity>> resourceMap = new HashMap<>();
            for (MetricEntity entity : instanceEntities) {
                resourceMap.computeIfAbsent(entity.getResource(), k -> new ArrayList<>()).add(entity);
            }
            
            Map<String, Iterable<MetricVo>> resourceMetrics = new LinkedHashMap<>();
            for (Map.Entry<String, List<MetricEntity>> entry : resourceMap.entrySet()) {
                List<MetricVo> vos = MetricVo.fromMetricEntities(entry.getValue(), entry.getKey());
                resourceMetrics.put(entry.getKey(), sortMetricVoAndDistinct(vos));
            }
            result.put(instance, resourceMetrics);
        }
        
        Map<String, Object> resultMap = new HashMap<>(16);
        resultMap.put("totalCount", instances.size());
        resultMap.put("totalPage", totalPage);
        resultMap.put("pageIndex", pageIndex);
        resultMap.put("pageSize", pageSize);
        resultMap.put("viewMode", "instance");
        resultMap.put("metric", result);
        return Result.ofSuccess(resultMap);
    }
}
