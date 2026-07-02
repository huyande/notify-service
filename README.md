# 微信教育管理系统

基于 NestJS + TypeORM + MySQL 的微信教育管理系统，提供家庭组、儿童账户、课程包、课程日志和微信订阅通知等功能。

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript
- **数据库**: MySQL (TypeORM)
- **认证**: JWT (jsonwebtoken + passport-jwt)
- **文档**: Swagger
- **分页**: nestjs-paginate
- **包管理**: pnpm

## 目录结构

```
src/
├── main.ts                    # 应用入口
├── app.module.ts              # 根模块（全局 JWT 守卫）
├── config/                    # 配置模块
├── database/                  # 数据库模块
├── common/                    # 共享代码
│   ├── dao/
│   │   └── base.dao.ts      # DAO 基类
│   ├── decorators/
│   │   └── public.decorator.ts # @Public() 装饰器
│   └── entities/
│       └── base.entity.ts    # 实体基类
└── modules/                   # 业务模块
    ├── auth/                 # JWT 认证模块
    ├── family/               # 家庭组与成员
    ├── child/                # 儿童账户
    ├── course/               # 课程包与时间规则
    ├── lesson-log/           # 课程变更日志
    └── notification/        # 微信订阅通知
```

## 安装和运行

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
```

## 环境变量

在 `.env` 文件中配置：

```bash
# 服务端口
APP_PORT=3000

# JWT 配置
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# MySQL 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=wx_nest
DB_SYNCHRONIZE=true
DB_LOGGING=true
DB_TIMEZONE=+08:00

# Swagger
SWAGGER_ENABLED=true

# 日志级别
LOG_LEVEL=log
```

## 架构设计

### 分层架构

```
Controller  →  Service  →  Dao  →  TypeORM Repository
   ↓            ↓           ↓
 DTO验证    业务逻辑    数据访问
```

**各层职责：**

| 层级 | 职责 | 说明 |
|------|------|------|
| **Controller** | 路由控制 | 接收请求、参数验证、返回响应 |
| **Service** | 业务逻辑 | 业务处理、异常转换、DTO 转换 |
| **Dao** | 数据访问 | 数据库操作、分页查询 |
| **Entity** | 数据模型 | TypeORM 实体定义 |

### BaseDao

所有 DAO 继承自 `BaseDao<T>`，提供通用 CRUD 方法：

```typescript
// src/common/dao/base.dao.ts
export abstract class BaseDao<T> {
  create(data): Promise<T>
  findOne(id): Promise<T | null>
  findMany(filter?): Promise<T[]>
  update(id, data): Promise<T | null>
  delete(id): Promise<void>
  paginate(query): Promise<Paginated<T>>
}
```

### 模块示例

```typescript
// 目录结构
modules/
  child/
    ├── child.controller.ts    # 路由
    ├── services/
    │   └── child.service.ts  # 业务逻辑
    ├── dao/
    │   └── child-account.dao.ts  # 数据访问
    ├── entities/
    │   └── child-account.entity.ts  # 实体
    ├── dto/
    │   └── child-account.dto.ts  # DTO
    └── child.module.ts        # 模块定义
```

## JWT 认证

### 认证流程

```
1. 用户请求 /auth/login (携带 wx-openid)
   ↓
2. 后端查询/创建用户，返回 accessToken + refreshToken + member
   ↓
3. 前端存储 token，后续请求携带 Authorization: Bearer {accessToken}
   ↓
4. accessToken 过期时，使用 refreshToken 获取新 token
   ↓
5. refreshToken 无效时，重新登录
```

### 认证接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/auth/login` | POST | 登录/注册 | ❌ 公开 |
| `/auth/refresh` | POST | 刷新 Token | ❌ 公开 |
| `/auth/logout` | POST | 登出 | ✅ 需要 |

### 请求示例

```bash
# 登录
curl -X POST http://localhost:3000/auth/login \
  -H "wx-openid: wx_abc123"

# 响应
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "member": {
    "id": "123",
    "groupId": null,
    "openId": "wx_abc123",
    "nickname": "用户123",
    "avatarUrl": "",
    "role": 1,
    "joinTime": "2026-07-02T..."
  }
}
```

### 保护接口

**全局认证（默认所有接口需要登录）：**

```typescript
import { Public } from '@/common/decorators/public.decorator';

@Controller('user')
export class UserController {
  // 公开接口
  @Public()
  @Post('register')
  register() { }

  // 需要认证的接口
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;  // 当前用户信息
  }
}
```

**前端请求：**

```typescript
// 携带 token
api.get('/user/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Token 处理建议

```typescript
// axios 拦截器示例
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 自动刷新
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const { data } = await api.post('/auth/refresh', {
        refreshToken: localStorage.getItem('refresh_token')
      });
      localStorage.setItem('access_token', data.accessToken);
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

## API 文档

启动服务后访问 Swagger 文档：

```
http://localhost:3000/api-docs
```

Swagger 支持：
- 在线测试接口
- Bearer Token 认证（右上角 Authorize 按钮）
- 接口参数说明

## 分页查询

使用 `nestjs-paginate` 进行分页：

```bash
# 分页参数
GET /child?page=1&limit=10&sortBy=createdAt:DESC

# 响应
{
  "data": [...],
  "meta": {
    "itemsPerPage": 10,
    "totalItems": 100,
    "currentPage": 1,
    "totalPages": 10
  },
  "links": {...}
}
```

## 许可证

MIT
