# Bull Board 集成实施计划

- 日期: 2026-11-04
- 状态: 已实现
- 关联: [docs/proposals/2026-10-25-generic-wechat-subscribe-push.md](../proposals/2026-10-25-generic-wechat-subscribe-push.md)

## 目标

为现有 `push` BullMQ 队列增加 Bull Board 可视化界面，用于查看队列状态、任务详情、失败原因和重试记录。

## 设计与安全边界

- 面板常驻挂载，入口由邮箱+密码登录页统一挡住（初版为 `BULL_BOARD_ENABLED` 开关，同日改为常驻+登录，开关已移除）。
- 默认路径 `/admin/queues`，可通过 `BULL_BOARD_PATH` 修改。
- 账户白名单走 `BULL_BOARD_ACCOUNTS`（`email:password,...`，密码不得含逗号或冒号）；未配置账户时面板挂载但无人能登录，等效关闭（登录页 503 提示）。
- 会话为 HMAC-SHA256 签名 Cookie（HttpOnly、SameSite=Lax、12 小时），密钥 `BULL_BOARD_SESSION_SECRET` 缺失时启动直接失败（fail-fast）。
- 面板使用 Bull Board `readOnlyMode`，禁用重试、删除、暂停等写操作。
- 登录路由 → 认证中间件 → 面板路由的挂载顺序在 `BullBoardDashboardModule` 内手动挂载 express router 确定，不依赖 Nest 模块导入顺序；因此不再使用 `@bull-board/nestjs` 的自动挂载。

## 任务

1. 安装 `@bull-board/api` + `@bull-board/express`（兼容 NestJS 11 / bullmq 6.4）。
2. 实现账户白名单（`board-accounts.ts`）与签名会话（`board-session.ts`）。
3. `bull-board.module.ts`：手动挂载登录页、认证中间件与只读面板。
4. 更新 `.env.example`、README 和变更日志。
5. 执行构建、单元测试、E2E，并启动 Redis 和应用验证完整登录链路。

## 验收标准

- 未登录访问面板任意路径均 302 跳转登录页。
- 错误邮箱/密码返回 401；正确账户签发 HttpOnly Cookie 并 303 进入面板。
- 持有效 Cookie 时面板 API 可见 `push` 队列，`readOnlyMode: true`、`allowRetries: false`。
- 未配置账户时登录页返回 503。
- 配置了账户但缺少 `BULL_BOARD_SESSION_SECRET` 时启动失败并给出明确错误。
- 构建和现有测试通过。
