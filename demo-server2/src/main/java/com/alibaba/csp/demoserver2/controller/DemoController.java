package com.alibaba.csp.demoserver2.controller;

import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DemoController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        Map<String, Object> result = new HashMap<>();
        
        try (Entry entry = SphU.entry("client-resource-hello")) {
            result.put("success", true);
            result.put("message", "Hello from Token Client!");
            result.put("timestamp", System.currentTimeMillis());
            return result;
        } catch (BlockException e) {
            result.put("success", false);
            result.put("message", "Blocked by Sentinel");
            result.put("reason", "Flow control");
            return result;
        }
    }

    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> result = new HashMap<>();
        
        try (Entry entry = SphU.entry("client-resource-test")) {
            result.put("success", true);
            result.put("message", "Test API from Token Client");
            result.put("timestamp", System.currentTimeMillis());
            return result;
        } catch (BlockException e) {
            result.put("success", false);
            result.put("message", "Blocked by Sentinel");
            result.put("reason", "Flow control");
            return result;
        }
    }

    @GetMapping("/cluster")
    public Map<String, Object> cluster() {
        Map<String, Object> result = new HashMap<>();
        
        try (Entry entry = SphU.entry("client-cluster-resource")) {
            result.put("success", true);
            result.put("message", "Cluster flow control test");
            result.put("mode", "cluster");
            result.put("timestamp", System.currentTimeMillis());
            return result;
        } catch (BlockException e) {
            result.put("success", false);
            result.put("message", "Blocked by Sentinel cluster flow control");
            result.put("reason", "Cluster limit reached");
            return result;
        }
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("application", "token-client");
        return result;
    }
}
