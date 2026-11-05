# notify-service：微信订阅消息推送服务
# Node 22 最新补丁版（pnpm@11 要求 Node >= 22.13，node:22 跟随 22.x 最新）
FROM node:22-bookworm-slim

# 时区上海（日志时间戳、订阅消息 time 类字段格式化均按本地时间理解）+ HTTPS 证书链
RUN apt-get update \
  && apt-get install -y --no-install-recommends tzdata ca-certificates \
  && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Shanghai

WORKDIR /app

# pnpm@11 与本地 lockfile 版本一致，避免 install 时重新解析
RUN npm install -g pnpm@11

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

RUN pnpm install --frozen-lockfile

COPY . /app

# 生产配置必须在镜像内（构建期发现遗漏，而不是启动后崩溃）
RUN test -f /app/.env.production || (echo "ERROR: .env.production not found in image" && exit 1)
# 多小程序账户配置（config/apps.yaml）同样必须在镜像内
RUN test -f /app/config/apps.yaml || (echo "ERROR: config/apps.yaml not found in image" && exit 1)

RUN pnpm run build

ENV NODE_ENV=production

# 应用主进程直接启动（API 与队列 Worker 同进程）
ENTRYPOINT ["node", "dist/main"]
