# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 NestJS + TypeORM + MySQL 的微信教育管理系统，主要处理家庭组、儿童账户、课程包、课程日志和微信订阅通知等业务。

## 包管理器

使用 `pnpm` 而非 `npm`。

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（热重载）
pnpm run start:dev

# 构建
pnpm run build

# 生产模式
pnpm run start:prod

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 单元测试
pnpm run test

# E2E 测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov
```

## 代码架构

```
src/
├── main.ts                    # 应用入口
├── app.module.ts              # 根模块
├── config/                     # 配置模块
│   ├── config.module.ts
│   └── database.config.ts     # TypeORM 配置
├── database/                   # 数据库模块
│   ├── database.module.ts
│   └── entities/              # 实体导出索引
├── common/                     # 共享代码
│   └── entities/
│       └── base.entity.ts     # 所有实体的基类（id, createdAt, updatedAt）
└── modules/                    # 业务模块（按功能划分）
    ├── family/                 # 家庭组与成员管理
    ├── child/                  # 儿童账户管理
    ├── course/                 # 课程包与课程时间规则
    ├── lesson-log/             # 课程变更日志
    └── notification/          # 微信订阅通知
```

每个业务模块遵循标准结构：
- `*.module.ts` - 模块定义
- `*.controller.ts` - 路由控制器
- `*.service.ts` - 业务逻辑
- `entities/` - TypeORM 实体
- `dto/` - 数据传输对象
- `enums/` - 枚举类型

## 数据库实体

所有实体继承自 `BaseEntity`（`src/common/entities/base.entity.ts`），包含：
- `id: string`（bigint 主键）
- `createdAt: Date`
- `updatedAt: Date`

实体需要在 `src/database/entities/index.ts` 中导出。

## 环境变量

```bash
# 服务端口
APP_PORT 或 PORT        # 默认 3000

# MySQL 数据库
DB_HOST                 # 默认 localhost
DB_PORT                 # 默认 3306
DB_USERNAME             # 默认 root
DB_PASSWORD             # 默认空
DB_DATABASE             # 默认 wx_nest
DB_SYNCHRONIZE          # 是否自动同步数据库结构（开发时设为 true）
DB_LOGGING              # 是否启用数据库日志
DB_TIMEZONE             # 数据库时区，默认 +08:00
```

## 代码风格

- ESLint + Prettier 配置在 `eslint.config.mjs` 和 `.prettierrc`
- Prettier：单引号、尾逗号（all）
- 使用 `@nestjs/typeorm` 进行数据库操作
- 使用 `@nestjs/config` 管理配置

## 使用 NestJS CLI 生成模块

```bash
# 生成新模块（含 controller、service）
nest g resource modules/<module-name>
```
