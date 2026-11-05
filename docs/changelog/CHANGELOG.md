# 变更日志

按日期倒序追加。格式：`## YYYY-MM-DD` 下用 `- [模块] 摘要` 记录当日变更。

## 2026-11-05

- [queue] PushProcessor 终态结果写入 job.returnValue（sent/refused/failed + errcode/errmsg），Bull Board 任务详情可区分业务结果与队列状态

- [部署] 新增 Dockerfile / .dockerignore / build.sh / rollback.sh / .env.production 模板：镜像化构建、保留 3 个历史镜像、交互式回滚；容器经 host.docker.internal 访问宿主 Redis

## 2026-11-04

- [queue] Bull Board 改为常驻挂载：移除 BULL_BOARD_ENABLED 开关，新增邮箱+密码登录页与 HMAC 签名 Cookie 会话（12h），账户走 BULL_BOARD_ACCOUNTS、密钥走 BULL_BOARD_SESSION_SECRET；面板保持只读
- [queue] 修复 Bull Board 登录后一直 loading：为 ExpressAdapter 设置 setBasePath，UI 静态资源以挂载路径解析（此前 base href=/ 导致 JS 404）
## 2026-10-26

- [清理] 删除旧「微信教育管理系统」遗留代码：`modules/`（auth/family/child/course/lesson-log/notification）、`database/`、`common/`（dao/entities/decorators）、`config/database.config.ts`
- [清理] 删除旧计划目录 `.plans/` 与 `plans/`
- [清理] 移除 JWT/TypeORM/MySQL 等遗留依赖（@nestjs/jwt、@nestjs/passport、typeorm、mysql2、nestjs-paginate、@nestjs/mapped-types），同步 lockfile
- [清理] 清理 `.env` 残留的数据库/JWT 凭据，改为 Redis 配置；`.gitignore` 增加 `.pnpm-store/`
- [重构] `app.module.ts`/`config.module.ts`/`main.ts` 收敛为推送服务骨架，移除数据库日志与 JWT bearer 配置
- [计划] 新增「微信订阅消息推送服务」实施计划（`plans/2026-10-26-generic-wechat-subscribe-push-implementation-plan.md`），并更新 `docs/README.md` 增加 `plans/` 目录
- [push] 实现 `POST /push/send`：DTO 校验 + `requestId` 幂等入队（`jobId = appId_requestId`，BullMQ 不允许 `:`）
- [queue] 装配 BullMQ（`Queue`/`Worker`/`QueueEvents` 语义），指数退避重试 + 死信 + Worker 限流；终态触发回调
- [wechat] 按 `appid` 的 `access_token` Redis 共享缓存、订阅消息发送、错误分类（43101 不重试 / 45009·40001 退避 / 40001 自动刷新重试）
- [app] 静态 `config/apps.yaml` 多小程序配置 + `AppRegistry`（按 `appId` 隔离、回调地址解析）
- [strategy] 强策略 `PushStrategy` + `StrategyRegistry` + 示例 `DemoStrategy`（`templateId` 路由）
- [callback] fire-and-forget 回调（异步 POST、不重试、无签名）
- [测试] 单元测试 19 个（app/strategy/wechat/dto/jobId）+ 最小 e2e；修复 jobId 含 `:` 的运行时缺陷
- [文档] 同步更新 proposal / 实施计划中的 jobId 拼接说明
- [config] 新增「课时记录」小程序（`wx1ab5ceabc337ef6c`）账户与「上课提醒」模板（`FgPoaf3IGz6HmzZlFzT34fQux7bNOwdMqF4sQHnIPpA`）配置
- [strategy] 新增 `CourseRemindStrategy`（thing17 课程名称 / time15 上课时间 / thing4 事项地点 / name1 提醒人）并注册
- [push] appId 未在 `config/apps.yaml` 配置时返回明确中文提示，引导补充账户配置
- [strategy] `strategies/` 按 appId 分目录（`strategies/<appId>/*.strategy.ts`），便于业务区分
- [skill] 新增项目级 `create-strategy` skill（`.agents/skills/create-strategy/SKILL.md`）：输入校验与补齐引导、策略生成/注册/配置、调用方数据结构输出
- [docs] `AGENTS.md` 修正遗留代码说明，补充 `strategy`/`callback`/`redis` 模块与项目级 skill 指针

## 2026-10-25

- [文档] 重写 `README.md`，将项目定位改为「微信小程序订阅消息推送服务」（BullMQ + Redis）
- [文档] 新增 `AGENTS.md`：技术框架、实现方式、方案规范与上下文工程（`docs/` 管理 + 自动落盘）
- [文档] 新增 `docs/` 上下文目录：`proposals/` 方案模板、`changelog/` 变更日志
- [方案] 新增「通用微信订阅消息推送服务」方案（`proposals/2026-10-25-generic-wechat-subscribe-push.md`）：BullMQ 可靠投递、多小程序隔离、强策略业务扩展、fire-and-forget 回调
