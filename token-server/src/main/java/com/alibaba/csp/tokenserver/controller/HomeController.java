package com.alibaba.csp.tokenserver.controller;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Home Controller - Provides basic endpoints for testing and health checks.
 */
@RestController
public class HomeController {

  private static final String APP_NAME = "Sentinel Token Server";
  private static final String VERSION = "1.0.0";

  @GetMapping("/")
  public ResponseEntity<Map<String, Object>> home() {
    Map<String, Object> response = new HashMap<>();
    response.put("name", APP_NAME);
    response.put("version", VERSION);
    response.put("status", "running");
    response.put("timestamp", LocalDateTime.now().toString());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/health")
  public ResponseEntity<Map<String, Object>> health() {
    Map<String, Object> response = new HashMap<>();
    response.put("status", "UP");
    response.put("message", "Service is healthy");
    response.put("timestamp", LocalDateTime.now().toString());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/version")
  public ResponseEntity<Map<String, String>> version() {
    Map<String, String> response = new HashMap<>();
    response.put("application", APP_NAME);
    response.put("version", VERSION);
    return ResponseEntity.ok(response);
  }
}
