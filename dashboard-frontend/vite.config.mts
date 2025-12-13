import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const root = __dirname;

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, root, '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080';

  // 关键：生产构建默认使用绝对路径（/），否则当用户/测试直接访问深层路由
  // 如 /dashboard/apps/<app>/metric 时，Vite 生成的相对资源路径会变成
  // /dashboard/apps/<app>/assets/*，被后端当作 SPA 路由返回 index.html，导致白屏。
  // 如需 GitHub Pages 等场景，可通过 VITE_BASE 覆盖为 './' 或 '/<repo>/'。
  const defaultBase = command === 'serve' ? '/' : '/';
  const base = (env.VITE_BASE || process.env.VITE_BASE || defaultBase).trim() || defaultBase;

  return {
    root,
    base,
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
