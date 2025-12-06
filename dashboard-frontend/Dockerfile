# Frontend Build Image
# 用于构建 React 前端，供 sentinel-dashboard 多阶段构建使用

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# Final stage - minimal image with only build output
FROM alpine:latest

WORKDIR /app

# Copy only vite build output (not src/, tests/, etc.)
COPY --from=builder /app/dist/vite ./dist

# This image is used as a source for other builds
# The dist folder is at /app/dist (contains index.html, assets/, locales/)
