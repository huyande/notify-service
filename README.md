# notify-service

微信小程序订阅消息推送服务。这是一个**只负责订阅消息推送**的独立服务：接收各小程序发来的推送请求，通过 BullMQ 队列可靠、异步地把订阅消息推送给微信用户。

## 职责边界

本服务只做一件事——订阅消息推送，不承载业务数据：

- 接收多个小程序的推送请求（统一 HTTP 入口）
- 管理各小程序的 `appid` / `secret` 与 `access_token`（获取、缓存、刷新）
- 通过 BullMQ（Redis）异步、可靠地推送
- 失败重试、限流、幂等与可观测日志

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | NestJS 11.x |
| 语言 | TypeScript |
| 队列 | BullMQ（依赖 Redis） |
| 缓存 | Redis（`access_token`、幂等去重） |
| 校验 | class-validator + class-transformer |
| 文档 | Swagger |
| 包管理 | pnpm |

## 核心流程

```
小程序 A ─┐
小程序 B ─┼──► HTTP API ──► BullMQ Queue ──► Worker ──► 微信订阅消息接口
小程序 C ─┘   (接收推送请求)   (Redis)          (消费)      subscribe/send
```

1. 小程序调用本服务提交推送请求（`appid` + 模板 + 接收者 + 参数 + `requestId`）。
2. 服务校验并去重（`requestId` 幂等）后入队。
3. Worker 消费任务，按 `appid` 获取/刷新 `access_token`，调用微信订阅消息接口。
4. 成功记录日志；失败按退避策略重试，超过上限进入死信队列。

## 快速开始

```bash
pnpm install
pnpm run start:dev
```

> 需要可用的 Redis。其余开发命令见 `package.json` scripts。

## 环境变量

在 `.env` 配置（参考 `.env.example`）：

```bash
APP_PORT=3000

# Redis（BullMQ 与缓存共用）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

> 多小程序的 `appid`/`secret`/模板/回调配置在 `config/apps.yaml`（静态配置，改后重启生效），设计见 `docs/proposals/`。

## 队列管理界面

项目集成了只读 Bull Board，入口由邮箱+密码登录页保护，无需单独的启停开关。启用步骤：

1. 配置登录账户（环境变量或 `.env`）：`BULL_BOARD_ACCOUNTS=admin@example.com:your-password`（多账户用逗号分隔；密码不得包含逗号或冒号）。
2. 配置会话密钥：`BULL_BOARD_SESSION_SECRET=<长随机串>`（缺失会导致启动失败）。
3. 启动后访问 `http://localhost:3000/admin/queues`，会跳转到登录页；登录后会话有效期 12 小时。

说明：

- `BULL_BOARD_PATH` 可自定义面板路径（默认 `/admin/queues`）。
- 未配置 `BULL_BOARD_ACCOUNTS` 时面板挂载但无人能登录，等效关闭；登录页会提示未配置账户。
- 面板为只读（禁用重试、删除、暂停）；账户密码明文存于环境变量，请通过密钥管理或部署平台注入，勿提交到仓库。

## 推送接口

`POST /push/send`（幂等）：

```bash
curl -X POST http://localhost:3000/push/send \
  -H 'Content-Type: application/json' \
  -d '{
    "requestId": "uuid-1",
    "appId": "wx1234567890abcdef",
    "templateId": "tpl_demo",
    "openid": "oXXXX",
    "data": { "title": "课程提醒", "time": "2026-10-26 19:00" },
    "callbackUrl": "https://partner.example.com/notify/callback"
  }'
```

接口返回 `202` 并异步入队；推送到达终态（`sent`/`refused`/`failed`/`exhausted`）后以 fire-and-forget 方式回调 `callbackUrl`（未传则用 `config/apps.yaml` 中该小程序的回调地址）。

## 容器部署

部署机上准备 `.env.production`（模板见仓库根 `.env.production`，已被 git 忽略；Redis 在宿主机时 `REDIS_HOST=host.docker.internal`），然后：

```bash
./build.sh      # 拉代码 → 构建镜像 → 重建容器（保留最近 3 个历史镜像）
./rollback.sh   # 交互式选择历史镜像回滚（也可 ./rollback.sh <tag>）
```

容器固定监听 3000，对外端口由脚本 `-p` 映射（默认 3000）；`config/apps.yaml` 与 `.env.production` 均打入镜像，改配置需重新构建。

## 相关文档

- 方案讨论与变更日志：见 `docs/`（其管理规则由 `AGENTS.md` 约定）。
