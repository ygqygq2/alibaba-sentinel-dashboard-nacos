package com.alibaba.csp.demoserver1.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Demo Server 1 状态接口
 * 提供 Demo Server 1 的运行状态和配置信息
 */
@RestController
public class HomeController {

  private static final String APP_NAME = "Demo Server 1";
  private static final String VERSION = "1.0.0";

  @GetMapping("/")
  public ResponseEntity<Map<String, Object>> home() {
    Map<String, Object> response = new HashMap<>();
    response.put("name", APP_NAME);
    response.put("version", VERSION);
    response.put("mode", "Cluster Client");
    response.put("status", "running");
    response.put("timestamp", LocalDateTime.now().toString());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/health")
  public ResponseEntity<Map<String, Object>> health() {
    Map<String, Object> response = new HashMap<>();
    response.put("status", "UP");
    response.put("message", "Demo Server 1 is healthy");
    response.put("timestamp", LocalDateTime.now().toString());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/version")
  public ResponseEntity<Map<String, String>> version() {
    Map<String, String> response = new HashMap<>();
    response.put("application", APP_NAME);
    response.put("version", VERSION);
    response.put("mode", "Cluster Client");
    return ResponseEntity.ok(response);
  }
}
