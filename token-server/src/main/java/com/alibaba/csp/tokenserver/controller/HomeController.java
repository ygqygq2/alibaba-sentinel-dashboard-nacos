package com.alibaba.csp.tokenserver.controller;

import com.alibaba.csp.sentinel.cluster.server.config.ClusterServerConfigManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Token Server 状态接口
 * 提供 Token Server 的运行状态和配置信息
 */
@RestController
public class HomeController {

  private static final String APP_NAME = "Sentinel Cluster Token Server";
  private static final String VERSION = "1.0.0";

  @GetMapping("/")
  public ResponseEntity<Map<String, Object>> home() {
    Map<String, Object> response = new HashMap<>();
    response.put("name", APP_NAME);
    response.put("version", VERSION);
    response.put("mode", "Standalone (Alone)");
    response.put("status", "running");
    response.put("timestamp", LocalDateTime.now().toString());
    return ResponseEntity.ok(response);
  }

  /**
   * 获取 Token Server 配置信息
   */
  @GetMapping("/cluster/config")
  public ResponseEntity<Map<String, Object>> clusterConfig() {
    Map<String, Object> response = new HashMap<>();
    response.put("port", ClusterServerConfigManager.getPort());
    response.put("idleSeconds", ClusterServerConfigManager.getIdleSeconds());
    response.put("embedded", ClusterServerConfigManager.isEmbedded());
    
    Set<String> namespaceSet = ClusterServerConfigManager.getNamespaceSet();
    response.put("namespaceSet", namespaceSet);
    response.put("namespaceCount", namespaceSet != null ? namespaceSet.size() : 0);
    
    return ResponseEntity.ok(response);
  }

  @GetMapping("/health")
  public ResponseEntity<Map<String, Object>> health() {
    Map<String, Object> response = new HashMap<>();
    response.put("status", "UP");
    response.put("message", "Cluster Token Server is healthy");
    response.put("timestamp", LocalDateTime.now().toString());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/version")
  public ResponseEntity<Map<String, String>> version() {
    Map<String, String> response = new HashMap<>();
    response.put("application", APP_NAME);
    response.put("version", VERSION);
    response.put("mode", "Standalone (Alone)");
    return ResponseEntity.ok(response);
  }
}
