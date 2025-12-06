package com.alibaba.csp.tokenserver.controller;

import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * 业务演示接口
 * 提供各种场景的接口用于测试 Dashboard 功能：
 * - 簇点链路：访问接口产生资源调用数据
 * - 流控测试：配置QPS限流后验证效果
 * - 熔断测试：模拟慢调用/异常场景
 * - 热点参数：带参数的接口用于热点规则测试
 * - 系统规则：高负载接口测试系统保护
 * - 授权规则：需要来源识别的接口
 * 
 * 通过环境变量 DEMO_API_ENABLED=true 启用，默认禁用
 * 生产环境不设置此变量即可禁用测试接口
 */
@RestController
@RequestMapping("/api")
@ConditionalOnProperty(name = "demo.api.enabled", havingValue = "true", matchIfMissing = false)
public class DemoController {

    private final Random random = new Random();

    // ==================== 基础接口（簇点链路测试）====================

    /**
     * 简单接口 - 用于簇点链路展示
     */
    @GetMapping("/hello")
    @SentinelResource(value = "hello", blockHandler = "helloBlockHandler")
    public ResponseEntity<Map<String, Object>> hello() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hello, Sentinel!");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> helloBlockHandler(BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Blocked by Sentinel");
        result.put("blockType", ex.getClass().getSimpleName());
        return ResponseEntity.status(429).body(result);
    }

    /**
     * 链路调用接口 - 模拟调用链
     * /api/chain -> resourceA -> resourceB -> resourceC
     */
    @GetMapping("/chain")
    public ResponseEntity<Map<String, Object>> chain() {
        Map<String, Object> result = new HashMap<>();
        
        try (Entry entry = SphU.entry("resourceA")) {
            result.put("resourceA", "success");
            
            try (Entry entryB = SphU.entry("resourceB")) {
                result.put("resourceB", "success");
                
                try (Entry entryC = SphU.entry("resourceC")) {
                    result.put("resourceC", "success");
                } catch (BlockException e) {
                    result.put("resourceC", "blocked");
                }
            } catch (BlockException e) {
                result.put("resourceB", "blocked");
            }
        } catch (BlockException e) {
            result.put("resourceA", "blocked");
        }
        
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    // ==================== 流控测试接口 ====================

    /**
     * QPS 流控测试接口
     * 配置 QPS 阈值后，超过阈值的请求会被限流
     */
    @GetMapping("/flow/qps")
    @SentinelResource(value = "flowQps", blockHandler = "flowBlockHandler")
    public ResponseEntity<Map<String, Object>> flowQps() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Flow QPS test passed");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 线程数流控测试接口
     * 模拟耗时操作，用于测试并发线程数限流
     */
    @GetMapping("/flow/thread")
    @SentinelResource(value = "flowThread", blockHandler = "flowBlockHandler")
    public ResponseEntity<Map<String, Object>> flowThread() throws InterruptedException {
        // 模拟耗时操作
        TimeUnit.MILLISECONDS.sleep(200);
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Flow Thread test passed");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 关联流控测试 - 资源A
     * 当资源B达到阈值时，限流资源A
     */
    @GetMapping("/flow/related/a")
    @SentinelResource(value = "relatedResourceA", blockHandler = "flowBlockHandler")
    public ResponseEntity<Map<String, Object>> flowRelatedA() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Related Resource A");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 关联流控测试 - 资源B
     */
    @GetMapping("/flow/related/b")
    @SentinelResource(value = "relatedResourceB", blockHandler = "flowBlockHandler")
    public ResponseEntity<Map<String, Object>> flowRelatedB() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Related Resource B");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> flowBlockHandler(BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Flow control triggered");
        result.put("blockType", ex.getClass().getSimpleName());
        result.put("rule", ex.getRule() != null ? ex.getRule().toString() : "unknown");
        return ResponseEntity.status(429).body(result);
    }

    // ==================== 熔断降级测试接口 ====================

    /**
     * 慢调用比例熔断测试
     * @param delay 延迟时间(ms)，默认随机0-500ms
     */
    @GetMapping("/degrade/slow")
    @SentinelResource(value = "degradeSlow", blockHandler = "degradeBlockHandler", 
                      fallback = "degradeSlowFallback")
    public ResponseEntity<Map<String, Object>> degradeSlow(
            @RequestParam(required = false) Integer delay) {
        try {
            int sleepTime = delay != null ? delay : random.nextInt(500);
            TimeUnit.MILLISECONDS.sleep(sleepTime);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Slow call completed");
            result.put("delay", sleepTime);
            result.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(result);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted", e);
        }
    }

    /**
     * 异常比例熔断测试
     * @param errorRate 错误率(0-100)，默认30%
     */
    @GetMapping("/degrade/error")
    @SentinelResource(value = "degradeError", blockHandler = "degradeBlockHandler",
                      fallback = "degradeErrorFallback")
    public ResponseEntity<Map<String, Object>> degradeError(
            @RequestParam(required = false, defaultValue = "30") Integer errorRate) {
        if (random.nextInt(100) < errorRate) {
            throw new RuntimeException("Simulated error for degrade test");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Error rate test passed");
        result.put("errorRate", errorRate);
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 异常数熔断测试
     * @param shouldError 是否抛出异常
     */
    @GetMapping("/degrade/exception")
    @SentinelResource(value = "degradeException", blockHandler = "degradeBlockHandler",
                      fallback = "degradeExceptionFallback")
    public ResponseEntity<Map<String, Object>> degradeException(
            @RequestParam(required = false, defaultValue = "false") Boolean shouldError) {
        if (shouldError) {
            throw new RuntimeException("Simulated exception for degrade test");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Exception count test passed");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> degradeBlockHandler(BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Circuit breaker open - service degraded");
        result.put("blockType", ex.getClass().getSimpleName());
        return ResponseEntity.status(503).body(result);
    }

    public ResponseEntity<Map<String, Object>> degradeSlowFallback(Integer delay, Throwable ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Fallback for slow call");
        result.put("error", ex.getMessage());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> degradeErrorFallback(Integer errorRate, Throwable ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Fallback for error");
        result.put("error", ex.getMessage());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> degradeExceptionFallback(Boolean shouldError, Throwable ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Fallback for exception");
        result.put("error", ex.getMessage());
        return ResponseEntity.ok(result);
    }

    // ==================== 热点参数测试接口 ====================

    /**
     * 热点参数测试 - 单参数
     * @param id 资源ID，可针对特定ID配置限流
     */
    @GetMapping("/hotspot/{id}")
    @SentinelResource(value = "hotspotById", blockHandler = "hotspotBlockHandler")
    public ResponseEntity<Map<String, Object>> hotspotById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hotspot param test");
        result.put("id", id);
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 热点参数测试 - 多参数
     * @param userId 用户ID
     * @param productId 商品ID
     */
    @GetMapping("/hotspot/multi")
    @SentinelResource(value = "hotspotMulti", blockHandler = "hotspotMultiBlockHandler")
    public ResponseEntity<Map<String, Object>> hotspotMulti(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hotspot multi-param test");
        result.put("userId", userId);
        result.put("productId", productId);
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 热点参数测试 - 字符串参数
     * @param type 类型参数
     */
    @GetMapping("/hotspot/type")
    @SentinelResource(value = "hotspotType", blockHandler = "hotspotTypeBlockHandler")
    public ResponseEntity<Map<String, Object>> hotspotType(@RequestParam String type) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hotspot type test");
        result.put("type", type);
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> hotspotBlockHandler(Long id, BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hotspot param blocked");
        result.put("id", id);
        result.put("blockType", ex.getClass().getSimpleName());
        return ResponseEntity.status(429).body(result);
    }

    public ResponseEntity<Map<String, Object>> hotspotMultiBlockHandler(
            Long userId, Long productId, BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hotspot multi-param blocked");
        result.put("userId", userId);
        result.put("productId", productId);
        return ResponseEntity.status(429).body(result);
    }

    public ResponseEntity<Map<String, Object>> hotspotTypeBlockHandler(String type, BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hotspot type blocked");
        result.put("type", type);
        return ResponseEntity.status(429).body(result);
    }

    // ==================== 系统规则测试接口 ====================

    /**
     * CPU 密集型接口 - 测试系统 CPU 使用率保护
     * @param iterations 计算迭代次数
     */
    @GetMapping("/system/cpu")
    @SentinelResource(value = "systemCpu", blockHandler = "systemBlockHandler")
    public ResponseEntity<Map<String, Object>> systemCpu(
            @RequestParam(required = false, defaultValue = "1000000") Integer iterations) {
        // CPU 密集计算
        double result = 0;
        for (int i = 0; i < iterations; i++) {
            result += Math.sin(i) * Math.cos(i);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CPU intensive task completed");
        response.put("iterations", iterations);
        response.put("result", result);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * 高 QPS 接口 - 测试系统 QPS 保护
     */
    @GetMapping("/system/qps")
    @SentinelResource(value = "systemQps", blockHandler = "systemBlockHandler")
    public ResponseEntity<Map<String, Object>> systemQps() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "System QPS test");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 高并发接口 - 测试系统并发线程数保护
     */
    @GetMapping("/system/thread")
    @SentinelResource(value = "systemThread", blockHandler = "systemBlockHandler")
    public ResponseEntity<Map<String, Object>> systemThread() throws InterruptedException {
        // 模拟耗时操作增加并发线程
        TimeUnit.MILLISECONDS.sleep(100);
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "System thread test");
        result.put("activeThreads", Thread.activeCount());
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * RT 测试接口 - 测试系统平均 RT 保护
     * @param delay 延迟时间
     */
    @GetMapping("/system/rt")
    @SentinelResource(value = "systemRt", blockHandler = "systemBlockHandler")
    public ResponseEntity<Map<String, Object>> systemRt(
            @RequestParam(required = false, defaultValue = "50") Integer delay) 
            throws InterruptedException {
        TimeUnit.MILLISECONDS.sleep(delay);
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "System RT test");
        result.put("delay", delay);
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> systemBlockHandler(BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "System protection triggered");
        result.put("blockType", ex.getClass().getSimpleName());
        return ResponseEntity.status(503).body(result);
    }

    // ==================== 授权规则测试接口 ====================

    /**
     * 授权测试接口
     * 需要配合请求头 X-Sentinel-Origin 使用
     */
    @GetMapping("/auth/resource")
    @SentinelResource(value = "authResource", blockHandler = "authBlockHandler")
    public ResponseEntity<Map<String, Object>> authResource(
            @RequestHeader(value = "X-Sentinel-Origin", required = false) String origin) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Auth resource accessed");
        result.put("origin", origin != null ? origin : "unknown");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 白名单测试接口
     */
    @GetMapping("/auth/whitelist")
    @SentinelResource(value = "authWhitelist", blockHandler = "authBlockHandler")
    public ResponseEntity<Map<String, Object>> authWhitelist(
            @RequestHeader(value = "X-Sentinel-Origin", required = false) String origin) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Whitelist resource accessed");
        result.put("origin", origin != null ? origin : "unknown");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    /**
     * 黑名单测试接口
     */
    @GetMapping("/auth/blacklist")
    @SentinelResource(value = "authBlacklist", blockHandler = "authBlockHandler")
    public ResponseEntity<Map<String, Object>> authBlacklist(
            @RequestHeader(value = "X-Sentinel-Origin", required = false) String origin) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Blacklist resource accessed");
        result.put("origin", origin != null ? origin : "unknown");
        result.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(result);
    }

    public ResponseEntity<Map<String, Object>> authBlockHandler(BlockException ex) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Authority rule blocked");
        result.put("blockType", ex.getClass().getSimpleName());
        return ResponseEntity.status(403).body(result);
    }

    // ==================== 综合场景测试接口 ====================

    /**
     * 订单服务模拟 - 综合场景
     * 模拟真实业务：查询商品 -> 扣减库存 -> 创建订单
     */
    @PostMapping("/order/create")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam(required = false, defaultValue = "1") Integer quantity) {
        
        Map<String, Object> result = new HashMap<>();
        
        // 1. 查询商品
        try (Entry entry = SphU.entry("queryProduct")) {
            result.put("queryProduct", "success");
            TimeUnit.MILLISECONDS.sleep(10);
        } catch (BlockException e) {
            result.put("queryProduct", "blocked");
            return ResponseEntity.status(429).body(result);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 2. 扣减库存
        try (Entry entry = SphU.entry("deductStock")) {
            result.put("deductStock", "success");
            TimeUnit.MILLISECONDS.sleep(20);
        } catch (BlockException e) {
            result.put("deductStock", "blocked");
            return ResponseEntity.status(429).body(result);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 3. 创建订单
        try (Entry entry = SphU.entry("createOrderRecord")) {
            result.put("createOrderRecord", "success");
            TimeUnit.MILLISECONDS.sleep(15);
        } catch (BlockException e) {
            result.put("createOrderRecord", "blocked");
            return ResponseEntity.status(429).body(result);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        result.put("orderId", "ORD" + System.currentTimeMillis());
        result.put("userId", userId);
        result.put("productId", productId);
        result.put("quantity", quantity);
        result.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(result);
    }

    /**
     * 用户服务模拟 - 带缓存的查询
     */
    @GetMapping("/user/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        // 先查缓存
        try (Entry entry = SphU.entry("userCache")) {
            boolean cacheHit = random.nextBoolean();
            result.put("cacheHit", cacheHit);
            
            if (!cacheHit) {
                // 缓存未命中，查数据库
                try (Entry dbEntry = SphU.entry("userDatabase")) {
                    TimeUnit.MILLISECONDS.sleep(50);
                    result.put("dbQuery", "success");
                } catch (BlockException e) {
                    result.put("dbQuery", "blocked");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        } catch (BlockException e) {
            result.put("cacheQuery", "blocked");
        }
        
        result.put("userId", id);
        result.put("username", "user_" + id);
        result.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(result);
    }

    /**
     * 批量查询接口 - 用于压测
     * @param count 请求次数
     */
    @GetMapping("/batch/query")
    public ResponseEntity<Map<String, Object>> batchQuery(
            @RequestParam(required = false, defaultValue = "10") Integer count) {
        
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int blockedCount = 0;
        
        for (int i = 0; i < count; i++) {
            try (Entry entry = SphU.entry("batchResource")) {
                successCount++;
            } catch (BlockException e) {
                blockedCount++;
            }
        }
        
        result.put("totalRequests", count);
        result.put("successCount", successCount);
        result.put("blockedCount", blockedCount);
        result.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(result);
    }
}
