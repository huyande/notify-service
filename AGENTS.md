# AGENTS.md

本文件指导 AI 编码代理在本仓库工作。项目是什么、怎么运行看 `README.md`；本文件只负责两件事——**怎么建**（技术框架与实现方式）和**怎么管上下文**（方案与变更的落盘规则）。

## 项目定位

只负责微信小程序订阅消息推送的独立服务：接收各小程序推送请求，经 BullMQ（Redis）队列可靠投递订阅消息。

> 注意：当前 `src/` 仍残留旧「微信教育管理系统」代码（`family` / `child` / `course` 等模块），与本服务定位无关，属待清理的遗留物。新代码一律按下方目标架构落位，不要沿用旧模块；旧的 `.plans/` 与 `plans/` 目录同理，已由 `docs/` 取代。

## 技术框架与实现方式

- **语言/框架**：TypeScript + NestJS 11。包管理用 `pnpm`；开发命令以 `package.json` scripts 为准。
- **队列**：BullMQ + Redis。生产端 `Queue` 入队，消费端 `Worker` 处理，`QueueEvents` 观测结果与失败。NestJS 集成用官方 `@nestjs/bullmq`。
- **模块划分**（目标）：
  - `push`：接收推送请求（HTTP 入口），DTO 校验 + `requestId` 幂等去重后入队。
  - `queue`：BullMQ 队列/Worker 装配，重试 / 退避 / 死信策略。
  - `wechat`：`access_token` 获取与缓存、订阅消息 `subscribe/send` 调用。
  - `app`：多小程序 `appid`/`secret` 的注册与隔离。

### 关键设计决策

- **多小程序隔离**：`access_token` 按 `appid` 缓存，绝不串用；每个小程序独立配置。
- **可靠投递**：`requestId` 幂等去重（同一次推送不重复发）；失败指数退避重试，超限进死信。
- **限流**：微信订阅消息接口有频率上限，Worker 用并发/频率控制而非无脑并发。
- **可观测**：每次推送的结构化日志带 `requestId`、`appid`、`openid`、结果、耗时。

## 上下文工程

与 AI 协作产生的**方案**与**变更**是一等工程资产，统一落在 `docs/`，让后续会话可复用、可回溯、可自动总结。

### 目录布局

```
docs/
├── README.md              # 上下文索引：目录组织 + 使用规则
├── proposals/             # 方案讨论：一份方案一个文件
│   └── _template.md       # 方案模板（写方案时复制并填充）
└── changelog/
    └── CHANGELOG.md       # 变更日志：按日期倒序追加
```

### 落盘规则（会话自动总结）

处理每个「讨论 → 定稿 → 实现」单元时，必须把结论落盘，而非只留在对话里：

1. **方案定稿** → 在 `docs/proposals/` 新建 `YYYY-MM-DD-<slug>.md`，按 `_template.md` 填充，状态标 `已定稿`。
2. **代码变更** → 在 `docs/changelog/CHANGELOG.md` 顶部追加 `## YYYY-MM-DD`，其下用 `- [模块] 一句话摘要` 记录当日变更。
3. **会话收尾** → 检查本会话是否有未落盘的方案或变更，补齐后再结束。

### 会话开始

接手新任务前，先读 `docs/README.md` 与最近的 `changelog` 条目、相关 `proposals/` 恢复上下文，再动手，避免凭空重做或与既定决策冲突。

## 方案规范

方案文档格式与字段见 `docs/proposals/_template.md`。要点：

- 一份方案一个文件，命名 `YYYY-MM-DD-<slug>.md`。
- 状态字段四选一：`讨论中 / 已定稿 / 已实现 / 已废弃`，随进展更新。
- 定稿前写清「备选方案与权衡」，决策要可回溯。
