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

> 多小程序的 `appid`/`secret` 配置方案待定，见 `docs/proposals/`。

## 相关文档

- 方案讨论与变更日志：见 `docs/`（其管理规则由 `AGENTS.md` 约定）。
