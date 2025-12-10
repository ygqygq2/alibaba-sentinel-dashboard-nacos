package com.alibaba.csp.tokenserver.heartbeat;

import com.alibaba.csp.sentinel.config.SentinelConfig;
import com.alibaba.csp.sentinel.log.RecordLog;
import com.alibaba.csp.sentinel.spi.Spi;
import com.alibaba.csp.sentinel.transport.HeartbeatSender;
import com.alibaba.csp.sentinel.transport.config.TransportConfig;
import com.alibaba.csp.sentinel.transport.endpoint.Endpoint;
import com.alibaba.csp.sentinel.transport.heartbeat.HeartbeatMessage;
import com.alibaba.csp.sentinel.transport.heartbeat.client.SimpleHttpClient;
import com.alibaba.csp.sentinel.transport.heartbeat.client.SimpleHttpRequest;
import com.alibaba.csp.sentinel.transport.heartbeat.client.SimpleHttpResponse;
import com.alibaba.csp.sentinel.util.StringUtil;

import java.util.List;
import java.util.Map;

/**
 * 带鉴权的心跳发送器 - 适配重构后的 Dashboard /registry/instance 接口
 * 
 * 功能：
 * 1. 使用自定义心跳路径 /registry/instance（而非官方的 /registry/machine）
 * 2. 在心跳请求中携带 app_secret 参数进行鉴权
 * 3. 通过 SPI 机制替换官方的 SimpleHttpHeartbeatSender
 * 
 * SPI 配置：
 * - 优先级：Spi.ORDER_LOWEST - 200（高于官方实现的 -100）
 * - 配置文件：META-INF/services/com.alibaba.csp.sentinel.transport.HeartbeatSender
 * 
 * 使用方式：
 * - 设置 JVM 参数：-Dcsp.sentinel.app.secret=your_secret
 * - 如果未设置 app_secret，心跳请求将不带鉴权参数（Dashboard 需要关闭鉴权）
 * 
 * @author Token Server Team
 */
@Spi(order = Spi.ORDER_LOWEST - 200)
public class AuthenticatedHeartbeatSender implements HeartbeatSender {

    private static final int OK_STATUS = 200;
    private static final long DEFAULT_INTERVAL = 10000; // 10秒

    /**
     * 自定义心跳路径（重构后的 Dashboard 接口）
     */
    private static final String HEARTBEAT_API_PATH = "/registry/instance";

    private final HeartbeatMessage heartBeat = new HeartbeatMessage();
    private final SimpleHttpClient httpClient = new SimpleHttpClient();

    private final List<Endpoint> addressList;
    private int currentAddressIdx = 0;

    public AuthenticatedHeartbeatSender() {
        // 从配置中获取 Dashboard 地址列表
        List<Endpoint> newAddrs = TransportConfig.getConsoleServerList();
        if (newAddrs.isEmpty()) {
            RecordLog.warn("[AuthenticatedHeartbeatSender] Dashboard server address not configured");
        } else {
            RecordLog.info("[AuthenticatedHeartbeatSender] Dashboard address retrieved: {}", newAddrs);
            RecordLog.info("[AuthenticatedHeartbeatSender] Using custom heartbeat path: {}", HEARTBEAT_API_PATH);
        }
        this.addressList = newAddrs;
    }

    @Override
    public boolean sendHeartbeat() throws Exception {
        // 检查 Command Center 端口是否已初始化
        if (TransportConfig.getRuntimePort() <= 0) {
            RecordLog.info("[AuthenticatedHeartbeatSender] Command server port not initialized, won't send heartbeat");
            return false;
        }

        Endpoint addrInfo = getAvailableAddress();
        if (addrInfo == null) {
            return false;
        }

        // 构建心跳请求
        SimpleHttpRequest request = new SimpleHttpRequest(addrInfo, HEARTBEAT_API_PATH);
        
        // 生成心跳参数（app, ip, port, version, hostname 等）
        Map<String, String> params = heartBeat.generateCurrentMessage();
        
        // ✅ 添加 app_secret 参数（如果配置了）
        String appSecret = System.getProperty("csp.sentinel.app.secret");
        if (StringUtil.isNotBlank(appSecret)) {
            params.put("app_secret", appSecret);
            RecordLog.debug("[AuthenticatedHeartbeatSender] Sending heartbeat with app_secret");
        } else {
            RecordLog.debug("[AuthenticatedHeartbeatSender] Sending heartbeat without app_secret (authentication disabled)");
        }
        
        request.setParams(params);

        try {
            SimpleHttpResponse response = httpClient.post(request);
            if (response.getStatusCode() == OK_STATUS) {
                RecordLog.debug("[AuthenticatedHeartbeatSender] Heartbeat sent successfully to {}", addrInfo);
                return true;
            } else if (clientErrorCode(response.getStatusCode())) {
                RecordLog.warn("[AuthenticatedHeartbeatSender] Failed to send heartbeat to " + addrInfo
                    + ", http status code: " + response.getStatusCode() + ", response: " + response.getBodyAsString());
            } else if (serverErrorCode(response.getStatusCode())) {
                RecordLog.warn("[AuthenticatedHeartbeatSender] Dashboard server error when sending heartbeat to " + addrInfo
                    + ", http status code: " + response.getStatusCode());
            }
        } catch (Exception e) {
            RecordLog.warn("[AuthenticatedHeartbeatSender] Failed to send heartbeat to " + addrInfo, e);
        }
        return false;
    }

    @Override
    public long intervalMs() {
        return DEFAULT_INTERVAL;
    }

    private Endpoint getAvailableAddress() {
        if (addressList == null || addressList.isEmpty()) {
            return null;
        }
        if (currentAddressIdx < 0) {
            currentAddressIdx = 0;
        }
        int index = currentAddressIdx % addressList.size();
        return addressList.get(index);
    }

    private boolean clientErrorCode(int code) {
        return code > 399 && code < 500;
    }

    private boolean serverErrorCode(int code) {
        return code > 499 && code < 600;
    }
}
