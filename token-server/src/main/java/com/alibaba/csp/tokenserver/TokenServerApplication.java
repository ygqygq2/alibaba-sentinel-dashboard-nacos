package com.alibaba.csp.tokenserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Token Server - Simple testing service for Sentinel Dashboard.
 * Provides basic endpoints for health checks and version information.
 */
@SpringBootApplication
public class TokenServerApplication {

  public static void main(String[] args) {
    SpringApplication.run(TokenServerApplication.class, args);
  }
}
