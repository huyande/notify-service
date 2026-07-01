# IMPL-001: JWT 认证与 Swagger 集成 - 开发计划

## 计划概述

**目标**: 为 wx-nest 项目添加 JWT 双 Token 认证系统和 Swagger API 文档支持

**技术栈**:
- NestJS 11.x
- TypeORM 1.x
- @nestjs/jwt, @nestjs/passport
- @nestjs/swagger

**预计工时**: 1-2 天

---

## 实施进度表

```mermaid
gantt
    title JWT 认证与 Swagger 集成开发进度
    dateFormat  HH:mm
    axisFormat  %H:%M

    section 阶段一：环境准备
    安装依赖          :a1, 00:05, 10m
    配置环境变量      :a2, after a1, 5m

    section 阶段二：Swagger 配置
    配置 Swagger UI   :b1, after a2, 15m
    测试 Swagger      :b2, after b1, 10m

    section 阶段三：Auth 模块结构
    创建模块文件      :c1, after b2, 10m
    创建 DTO          :c2, after c1, 15m

    section 阶段四：认证逻辑
    JWT 配置          :d1, after c2, 10m
    Passport 策略     :d2, after d1, 20m
    登录/注册逻辑     :d3, after d2, 30m
    刷新 Token 逻辑   :d4, after d3, 20m
    登出逻辑          :d5, after d4, 15m

    section 阶段五：数据模型
    修改实体          :e1, after d5, 10m
    数据库迁移        :e2, after e1, 5m

    section 阶段六：测试验证
    接口测试          :f1, after e2, 20m
    端到端测试        :f2, after f1, 15m
```

---

## 阶段一：环境准备

### 任务 1.1: 安装依赖包

**文件**: `package.json`

**步骤**:

**步骤 1: 安装依赖**

```bash
pnpm add @nestjs/jwt @nestjs/passport @nestjs/swagger passport passport-jwt
```

**验收标准**:
- [ ] package.json 中包含新依赖
- [ ] pnpm install 无报错

---

### 任务 1.2: 配置环境变量

**文件**: `.env` 或环境配置

**步骤**:

**步骤 1: 添加 JWT 环境变量**

```bash
# JWT 配置
JWT_ACCESS_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Swagger 配置
SWAGGER_ENABLED=true
```

**验收标准**:
- [ ] 环境变量已配置
- [ ] ConfigService 可读取这些值

---

## 阶段二：Swagger 配置

### 任务 2.1: 配置 Swagger UI

**文件**:
- 修改: `src/main.ts`

**步骤**:

**步骤 1: 修改 main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 配置
  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('wx-nest API')
      .setDescription('微信教育管理系统 API 文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: '请输入 JWT token',
          in: 'header',
        },
        'bearer', // 这个名称要和 @ApiBearerAuth() 装饰器匹配
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // 持久化认证状态
        tagsSorter: 'alpha',        // 按字母排序标签
        operationsSorter: 'alpha', // 按字母排序操作
      },
    });
  }

  await app.listen(process.env.APP_PORT ?? process.env.PORT ?? 3000);
}
void bootstrap();
```

**验收标准**:
- [ ] 访问 `http://localhost:3000/api-docs` 可看到 Swagger UI
- [ ] 页面标题为 "wx-nest API"
- [ ] 右上角有 "Authorize" 按钮

---

## 阶段三：Auth 模块基础结构

### 任务 3.1: 创建 Auth 模块文件

**文件**:
- 创建: `src/modules/auth/auth.module.ts`
- 创建: `src/modules/auth/auth.controller.ts`
- 创建: `src/modules/auth/auth.service.ts`
- 创建: `src/modules/auth/constants.ts`

**步骤**:

**步骤 1: 创建 constants.ts**

```typescript
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
export const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_ACCESS_SECRET;
export const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
```

**步骤 2: 创建 auth.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyMember } from '../family/entities/family-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyMember]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
```

**步骤 3: 创建 auth.controller.ts (骨架)**

```typescript
import { Controller, Post, Headers, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '登录/注册' })
  async login(@Headers('wx-openid') openId: string): Promise<LoginResponseDto> {
    return this.authService.login(openId);
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新 Token' })
  async refresh(@Body() refreshDto: RefreshDto): Promise<LoginResponseDto> {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Post('logout')
  @UseGuards('JwtAuthGuard')
  @ApiBearerAuth()
  @ApiOperation({ summary: '登出' })
  async logout(): Promise<{ message: string }> {
    // TODO: 实现登出逻辑
    return { message: '登出成功' };
  }
}
```

**步骤 4: 创建 auth.service.ts (骨架)**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { FamilyMember } from '../family/entities/family-member.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { JWT_ACCESS_EXPIRATION, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION } from './constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(FamilyMember)
    private memberRepository: Repository<FamilyMember>,
    private jwtService: JwtService,
  ) {}

  async login(openId: string): Promise<LoginResponseDto> {
    // TODO: 实现登录逻辑
    throw new Error('Not implemented');
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    // TODO: 实现刷新逻辑
    throw new Error('Not implemented');
  }
}
```

**验收标准**:
- [ ] 所有文件创建成功
- [ ] 无 TypeScript 编译错误

---

### 任务 3.2: 创建 DTO

**文件**:
- 创建: `src/modules/auth/dto/login-response.dto.ts`
- 创建: `src/modules/auth/dto/refresh.dto.ts`

**步骤**:

**步骤 1: 创建 login-response.dto.ts**

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: '访问令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}
```

**步骤 2: 创建 refresh.dto.ts**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

**验收标准**:
- [ ] DTO 文件创建成功
- [ ] Swagger 中可以正确显示 DTO 结构

---

## 阶段四：认证逻辑实现

### 任务 4.1: 创建 JWT 配置

**文件**:
- 创建: `src/modules/auth/config/jwt.config.ts`

**步骤**:

**步骤 1: 创建 JWT 配置**

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
```

**验收标准**:
- [ ] 配置文件创建成功

---

### 任务 4.2: 创建 Passport 策略和守卫

**文件**:
- 创建: `src/modules/auth/guards/jwt.strategy.ts`
- 创建: `src/modules/auth/guards/jwt-auth.guard.ts`

**步骤**:

**步骤 1: 创建 jwt.strategy.ts**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyMember } from '../../family/entities/family-member.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(FamilyMember)
    private memberRepository: Repository<FamilyMember>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string; openId: string }) {
    const member = await this.memberRepository.findOne({
      where: { id: payload.sub },
    });

    if (!member) {
      throw new UnauthorizedException('用户不存在');
    }

    return member;
  }
}
```

**步骤 2: 创建 jwt-auth.guard.ts**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**验收标准**:
- [ ] 策略和守卫文件创建成功
- [ ] 无编译错误

---

### 任务 4.3: 实现登录/注册逻辑

**文件**:
- 修改: `src/modules/auth/auth.service.ts`

**步骤**:

**步骤 1: 实现完整 login 方法**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FamilyMember } from '../family/entities/family-member.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { MemberRole } from '../family/enums/member-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(FamilyMember)
    private memberRepository: Repository<FamilyMember>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(openId: string): Promise<LoginResponseDto> {
    if (!openId) {
      throw new UnauthorizedException('缺少 openId');
    }

    // 1. 查询用户
    let member = await this.memberRepository.findOne({
      where: { openId },
    });

    // 2. 不存在则自动注册
    const now = new Date();
    if (!member) {
      member = this.memberRepository.create({
        openId,
        nickname: `用户${openId.slice(-4)}`,
        avatarUrl: '',
        role: MemberRole.MEMBER,
        groupId: '1', // TODO: 需要关联到实际的家庭组
        joinTime: now,
        isRemindEnabled: 1,
      });
      member = await this.memberRepository.save(member);
    }

    // 3. 检查现有 refreshToken 是否有效（多设备共存）
    const refreshExpirationDays = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    );
    const tokenExpiresAt = new Date(member.tokenExpiresAt);

    if (
      member.refreshToken &&
      member.tokenExpiresAt &&
      tokenExpiresAt > now
    ) {
      // 有效：直接返回现有 Token
      const accessToken = await this.generateAccessToken(member);
      return {
        accessToken,
        refreshToken: member.refreshToken,
      };
    }

    // 4. 无效/不存在：颁发新 Token
    const accessToken = await this.generateAccessToken(member);
    const refreshToken = await this.generateRefreshToken(member);
    const newTokenExpiresAt = new Date(
      now.getTime() + refreshExpirationDays * 24 * 60 * 60 * 1000,
    );

    member.refreshToken = refreshToken;
    member.tokenExpiresAt = newTokenExpiresAt;
    await this.memberRepository.save(member);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(member: FamilyMember): Promise<string> {
    const payload = { sub: member.id, openId: member.openId };
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION');
    return this.jwtService.sign(payload, { expiresIn });
  }

  private async generateRefreshToken(member: FamilyMember): Promise<string> {
    const payload = { sub: member.id, openId: member.openId, type: 'refresh' };
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION');
    return this.jwtService.sign(payload, { secret, expiresIn });
  }
}
```

**验收标准**:
- [ ] 登录接口可以正确返回 Token
- [ ] 新用户可以自动注册

---

### 任务 4.4: 实现刷新 Token 逻辑

**文件**:
- 修改: `src/modules/auth/auth.service.ts`

**步骤**:

**步骤 1: 添加 refresh 方法**

```typescript
async refresh(refreshToken: string): Promise<LoginResponseDto> {
  if (!refreshToken) {
    throw new UnauthorizedException('缺少 refreshToken');
  }

  try {
    // 验证 refreshToken
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const payload = this.jwtService.verify(refreshToken, { secret });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token 类型无效');
    }

    // 查询用户
    const member = await this.memberRepository.findOne({
      where: { id: payload.sub },
    });

    if (!member) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证数据库中的 refreshToken 是否匹配
    if (member.refreshToken !== refreshToken) {
      throw new UnauthorizedException('RefreshToken 无效');
    }

    // 生成新的 Token 对
    const accessToken = await this.generateAccessToken(member);
    const newRefreshToken = await this.generateRefreshToken(member);

    const refreshExpirationDays = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    );
    const newTokenExpiresAt = new Date(
      Date.now() + refreshExpirationDays * 24 * 60 * 60 * 1000,
    );

    member.refreshToken = newRefreshToken;
    member.tokenExpiresAt = newTokenExpiresAt;
    await this.memberRepository.save(member);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new UnauthorizedException('RefreshToken 验证失败');
  }
}
```

**验收标准**:
- [ ] 刷新接口可以正确返回新 Token
- [ ] 过期的 refreshToken 会被拒绝

---

### 任务 4.5: 实现登出逻辑

**文件**:
- 修改: `src/modules/auth/auth.service.ts`
- 修改: `src/modules/auth/auth.controller.ts`

**步骤**:

**步骤 1: 添加 logout 方法到 AuthService**

```typescript
async logout(memberId: string): Promise<void> {
  const member = await this.memberRepository.findOne({
    where: { id: memberId },
  });

  if (member) {
    member.refreshToken = null;
    member.tokenExpiresAt = null;
    await this.memberRepository.save(member);
  }
}
```

**步骤 2: 更新 AuthController**

```typescript
import { Request } from 'express';

// ... 其他导入

@Post('logout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: '登出' })
async logout(@Request() req): Promise<{ message: string }> {
  await this.authService.logout(req.user.id);
  return { message: '登出成功' };
}
```

**验收标准**:
- [ ] 登出接口清除 refreshToken
- [ ] 登出后无法使用旧 Token

---

## 阶段五：数据模型变更

### 任务 5.1: 修改 FamilyMember 实体

**文件**:
- 修改: `src/modules/family/entities/family-member.entity.ts`

**步骤**:

**步骤 1: 添加新字段**

在 `FamilyMember` 类中添加：

```typescript
@Column({ name: 'refresh_token', length: 512, nullable: true })
refreshToken: string;

@Column({ name: 'token_expires_at', type: 'datetime', nullable: true })
tokenExpiresAt: Date;
```

**验收标准**:
- [ ] 实体文件包含新字段
- [ ] 无编译错误

---

### 任务 5.2: 执行数据库迁移

**步骤**:

**步骤 1: 启用数据库同步（开发环境）**

```bash
# 确保 .env 中 DB_SYNCHRONIZE=true
```

**步骤 2: 重启应用**

```bash
pnpm run start:dev
```

**验收标准**:
- [ ] 数据库表已更新
- [] 可以手动验证新字段存在

---

## 阶段六：测试验证

### 任务 6.1: 接口测试

**步骤**:

**步骤 1: 测试登录接口**

```bash
# 测试登录/注册
curl -X POST http://localhost:3000/auth/login \
  -H "wx-openid: test_openid_123" \
  -H "Content-Type: application/json"
```

**步骤 2: 测试刷新接口**

```bash
# 使用步骤 1 返回的 refreshToken
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your_refresh_token_here"}'
```

**步骤 3: 测试受保护接口**

```bash
# 使用 accessToken 访问受保护接口
curl -X GET http://localhost:3000/family \
  -H "Authorization: Bearer your_access_token_here"
```

**验收标准**:
- [ ] 登录接口返回 Token
- [ ] 刷新接口返回新 Token
- [ ] 受保护接口需要认证

---

### 任务 6.2: 端到端测试

**步骤**:

**步骤 1: 在 Swagger 中测试**

1. 访问 `http://localhost:3000/api-docs`
2. 点击 "Authorize"，输入 Token
3. 测试各个接口

**验收标准**:
- [ ] Swagger UI 正常显示
- [ ] Bearer Auth 认证正常工作
- [ ] 所有接口文档正确

---

## 检查清单

### 代码质量
- [ ] 所有文件符合 ESLint 规范
- [ ] 所有文件符合 Prettier 格式
- [ ] 无 TypeScript 编译错误
- [ ] 无未使用的导入

### 功能验证
- [ ] 新用户自动注册
- [ ] 老用户正常登录
- [ ] 多设备共存逻辑正确
- [ ] Token 刷新正常
- [ ] 登出清除 Token
- [ ] 过期 Token 被拒绝

### Swagger 文档
- [ ] Swagger UI 可访问
- [ ] 接口分组清晰
- [ ] DTO 结构正确显示
- [ ] Bearer Auth 可配置

### 安全检查
- [ ] JWT Secret 已配置
- [ ] 生产环境关闭 Swagger（可选）
- [ ] 敏感信息未提交到代码库

---

## 后续优化

### 可选功能
- [ ] RefreshToken Hash 存储
- [ ] 多设备管理（查看/撤销设备）
- [ ] Token 黑名单
- [ ] 强制登出
- [ ] 为现有 DTO 添加 Swagger 装饰器

### 性能优化
- [ ] Redis 存储 RefreshToken
- [ ] Token 缓存机制

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2026-07-01 | 初始版本 |
