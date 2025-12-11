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
package com.alibaba.csp.sentinel.dashboard.datasource.entity.rule;

import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowClusterConfig;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowItem;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRule;
import com.alibaba.csp.sentinel.util.AssertUtil;
import com.alibaba.fastjson.annotation.JSONField;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

/**
 * @author Eric Zhao
 * @since 0.2.1
 */
public class ParamFlowRuleEntity extends AbstractRuleEntity<ParamFlowRule> {

    public ParamFlowRuleEntity() {
        this.rule = new ParamFlowRule();
    }

    public ParamFlowRuleEntity(ParamFlowRule rule) {
        AssertUtil.notNull(rule, "Authority rule should not be null");
        this.rule = rule;
    }

    public static ParamFlowRuleEntity fromParamFlowRule(String app, String ip, Integer port, ParamFlowRule rule) {
        ParamFlowRuleEntity entity = new ParamFlowRuleEntity(rule);
        entity.setApp(app);
        entity.setIp(ip);
        entity.setPort(port);
        return entity;
    }

    public String getLimitApp() {
        return rule.getLimitApp();
    }

    public void setLimitApp(String limitApp) {
        rule.setLimitApp(limitApp);
    }

    public String getResource() {
        return rule.getResource();
    }

    public void setResource(String resource) {
        rule.setResource(resource);
    }

    public int getGrade() {
        return rule.getGrade();
    }

    public void setGrade(int grade) {
        rule.setGrade(grade);
    }

    public Integer getParamIdx() {
        return rule.getParamIdx();
    }

    public void setParamIdx(Integer paramIdx) {
        rule.setParamIdx(paramIdx);
    }

    public double getCount() {
        return rule.getCount();
    }

    public void setCount(double count) {
        rule.setCount(count);
    }

    public List<ParamFlowItem> getParamFlowItemList() {
        return rule.getParamFlowItemList();
    }

    public void setParamFlowItemList(List<ParamFlowItem> paramFlowItemList) {
        rule.setParamFlowItemList(paramFlowItemList);
    }

    public int getControlBehavior() {
        return rule.getControlBehavior();
    }

    public void setControlBehavior(int controlBehavior) {
        rule.setControlBehavior(controlBehavior);
    }

    public int getMaxQueueingTimeMs() {
        return rule.getMaxQueueingTimeMs();
    }

    public void setMaxQueueingTimeMs(int maxQueueingTimeMs) {
        rule.setMaxQueueingTimeMs(maxQueueingTimeMs);
    }

    public int getBurstCount() {
        return rule.getBurstCount();
    }

    public void setBurstCount(int burstCount) {
        rule.setBurstCount(burstCount);
    }

    public long getDurationInSec() {
        return rule.getDurationInSec();
    }

    public void setDurationInSec(long durationInSec) {
        rule.setDurationInSec(durationInSec);
    }

    public boolean isClusterMode() {
        return rule.isClusterMode();
    }

    public void setClusterMode(boolean clusterMode) {
        rule.setClusterMode(clusterMode);
    }

    public ParamFlowClusterConfig getClusterConfig() {
        return rule.getClusterConfig();
    }

    public void setClusterConfig(ParamFlowClusterConfig clusterConfig) {
        rule.setClusterConfig(clusterConfig);
    }
}
