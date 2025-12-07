import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const root = __dirname;

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, root, '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080';

  return {
    root,
    // dev 环境使用 /，prod 环境使用 './'
    base: command === 'serve' ? '/' : './',
    plugins: [react()],
    build: {
      outDir: 'dist/vite',
    },
    resolve: {
      alias: [
        {
          find: /^~(.+)/,
          replacement: path.join(process.cwd(), 'node_modules/$1'),
        },
        {
          find: /^@\/(.+)/,
          replacement: path.join(process.cwd(), 'src/$1'),
        },
      ],
    },
    server: {
      port: parseInt(env.VITE_APP_PORT || '3000'),
      strictPort: true, // 严格使用指定端口，如果被占用则报错而不是切换端口
      proxy: {
        // Sentinel Dashboard API 代理
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // 后端认证 API（只代理 /auth/login，不代理 /auth/custom 前端路由）
        '/auth/login': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/auth/logout': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/app': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/resource': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/cluster': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/gateway': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/metric': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/version': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        // 规则 API
        '/v1': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/v2': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/degrade': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/paramFlow': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/system': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/authority': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
    },
  };
});
