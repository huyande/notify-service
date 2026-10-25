# 项目上下文索引

本目录承载本项目与 AI 协作产生的**方案**与**变更**，是可复用、可回溯的项目记忆。接手任何任务前先读本文件。

## 布局

| 路径 | 用途 |
|------|------|
| `docs/proposals/` | 方案讨论：一份方案一个文件 |
| `docs/changelog/CHANGELOG.md` | 变更日志：按日期倒序追加 |

## 使用规则

- **写方案**：复制 `proposals/_template.md` 为 `proposals/YYYY-MM-DD-<slug>.md`，填充并维护状态字段。
- **记变更**：每次实现/改动后，在 `CHANGELOG.md` 顶部追加 `## YYYY-MM-DD` 及 `- [模块] 摘要`。
- **恢复上下文**：新会话先读本文件 + 最近的 `CHANGELOG.md` 条目 + 相关 `proposals/`。
