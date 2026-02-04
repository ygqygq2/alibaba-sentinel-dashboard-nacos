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
package com.alibaba.csp.sentinel.dashboard.domain.cluster.state;

/**
 * @author Eric Zhao
 * @since 1.4.1
 */
public class AppClusterClientStateWrapVO {

    /**
     * {ip}@{transport_command_port}.
     */
    private String id;

    private Integer commandPort;
    private String ip;
    
    // 新增扁平化字段，方便前端使用
    private String app;  // 应用名称
    private Integer port;  // 应用端口
    private String serverHost;  // Token Server 地址
    private Integer serverPort;  // Token Server 端口
    private Integer requestTimeout;  // 请求超时（毫秒）

    private ClusterClientStateVO state;

    public String getId() {
        return id;
    }

    public AppClusterClientStateWrapVO setId(String id) {
        this.id = id;
        return this;
    }

    public String getIp() {
        return ip;
    }

    public AppClusterClientStateWrapVO setIp(String ip) {
        this.ip = ip;
        return this;
    }

    public ClusterClientStateVO getState() {
        return state;
    }

    public AppClusterClientStateWrapVO setState(ClusterClientStateVO state) {
        this.state = state;
        return this;
    }

    public Integer getCommandPort() {
        return commandPort;
    }

    public AppClusterClientStateWrapVO setCommandPort(Integer commandPort) {
        this.commandPort = commandPort;
        return this;
    }

    public String getApp() {
        return app;
    }

    public AppClusterClientStateWrapVO setApp(String app) {
        this.app = app;
        return this;
    }

    public Integer getPort() {
        return port;
    }

    public AppClusterClientStateWrapVO setPort(Integer port) {
        this.port = port;
        return this;
    }

    public String getServerHost() {
        return serverHost;
    }

    public AppClusterClientStateWrapVO setServerHost(String serverHost) {
        this.serverHost = serverHost;
        return this;
    }

    public Integer getServerPort() {
        return serverPort;
    }

    public AppClusterClientStateWrapVO setServerPort(Integer serverPort) {
        this.serverPort = serverPort;
        return this;
    }

    public Integer getRequestTimeout() {
        return requestTimeout;
    }

    public AppClusterClientStateWrapVO setRequestTimeout(Integer requestTimeout) {
        this.requestTimeout = requestTimeout;
        return this;
    }

    @Override
    public String toString() {
        return "AppClusterClientStateWrapVO{" +
            "id='" + id + '\'' +
            ", commandPort=" + commandPort +
            ", ip='" + ip + '\'' +
            ", app='" + app + '\'' +
            ", port=" + port +
            ", serverHost='" + serverHost + '\'' +
            ", serverPort=" + serverPort +
            ", requestTimeout=" + requestTimeout +
            ", state=" + state +
            '}';
    }
}
