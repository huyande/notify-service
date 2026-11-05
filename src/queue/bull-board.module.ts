import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import {
  Inject,
  Injectable,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bullmq';
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { BoardAccounts } from './board-accounts';
import {
  BOARD_SESSION_COOKIE,
  BOARD_SESSION_TTL_SEC,
  BoardSession,
} from './board-session';
import { PUSH_QUEUE } from './queue.constants';

const DEFAULT_BOARD_PATH = '/admin/queues';

export const BOARD_ACCOUNTS = 'BOARD_ACCOUNTS';
export const BOARD_SESSION = 'BOARD_SESSION';

/**
 * Bull Board 队列仪表盘：常驻挂载、只读，入口由邮箱+密码登录页保护。
 * 账户来自 BULL_BOARD_ACCOUNTS（`email:password,...`）；未配置账户时无人可登录。
 * 通过 NestModule.configure 在中间件阶段挂载（先于 Nest 路由与 404 兜底），
 * 登录路由 → 认证中间件 → 面板路由的顺序由 router 内部声明顺序保证。
 */
@Module({
  imports: [BullModule.registerQueue({ name: PUSH_QUEUE })],
  providers: [
    {
      provide: BOARD_ACCOUNTS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new BoardAccounts(config.get<string>('BULL_BOARD_ACCOUNTS')),
    },
    {
      provide: BOARD_SESSION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('BULL_BOARD_SESSION_SECRET');
        if (!secret) {
          throw new Error(
            'BULL_BOARD_SESSION_SECRET 未配置：Bull Board 会话签名密钥必须提供',
          );
        }
        return new BoardSession(secret);
      },
    },
  ],
})
export class BullBoardDashboardModule implements NestModule {
  private readonly path = (
    process.env.BULL_BOARD_PATH ?? DEFAULT_BOARD_PATH
  ).replace(/\/+$/, '');

  constructor(
    @InjectQueue(PUSH_QUEUE) private readonly queue: Queue,
    @Inject(BOARD_ACCOUNTS) private readonly accounts: BoardAccounts,
    @Inject(BOARD_SESSION) private readonly session: BoardSession,
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    const board = new ExpressAdapter();
    // UI 以挂载路径为基准解析静态资源与 API；缺失时 <base href="/"> 会导致 JS 加载 404、页面永远 loading。
    board.setBasePath(this.path);
    createBullBoard({
      queues: [new BullMQAdapter(this.queue, { readOnlyMode: true })],
      serverAdapter: board,
    });

    const router = Router();

    router.get('/login', (_req: Request, res: Response) => {
      res
        .status(this.accounts.configured ? 200 : 503)
        .type('html')
        .send(loginPage(this.accounts.configured, undefined, this.path));
    });

    router.post('/login', (req: Request, res: Response) => {
      const { email, password } = (req.body ?? {}) as {
        email?: string;
        password?: string;
      };
      if (!this.accounts.verify(email, password)) {
        res
          .status(401)
          .type('html')
          .send(loginPage(true, '邮箱或密码错误', this.path));
        return;
      }
      res.setHeader(
        'Set-Cookie',
        `${BOARD_SESSION_COOKIE}=${this.session.issue()}; HttpOnly; SameSite=Lax; Path=${this.path}; Max-Age=${BOARD_SESSION_TTL_SEC}`,
      );
      res.redirect(303, `${this.path}/`);
    });

    router.use((req: Request, res: Response, next: NextFunction) => {
      if (
        this.session.verify(
          readCookie(req.headers.cookie, BOARD_SESSION_COOKIE),
        )
      ) {
        next();
        return;
      }
      res.redirect(302, `${this.path}/login`);
    });
    router.use(board.getRouter());

    consumer.apply(router).forRoutes(this.path, `${this.path}/*splat`);
  }
}

/** 仅匹配完整 cookie 名，避免 `x_board_session` 之类前缀误命中。 */
function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  for (const part of (header ?? '').split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}

function loginPage(
  configured: boolean,
  error?: string,
  path: string = DEFAULT_BOARD_PATH,
): string {
  const notice = configured
    ? ''
    : '<p class="notice">尚未配置任何登录账户（BULL_BOARD_ACCOUNTS），面板暂不可用。</p>';
  const errorHtml = error ? `<p class="error">${error}</p>` : '';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>队列仪表盘登录</title>
<style>
  body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f6f8; }
  .card { background: #fff; border: 1px solid #e2e4e9; border-radius: 10px; padding: 32px; width: 320px; }
  h1 { font-size: 18px; margin: 0 0 20px; }
  label { display: block; font-size: 13px; margin: 12px 0 4px; color: #444; }
  input { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; }
  button { margin-top: 20px; width: 100%; padding: 9px; border: 0; border-radius: 6px; background: #1f6feb; color: #fff; font-size: 14px; cursor: pointer; }
  .error { color: #c0392b; font-size: 13px; }
  .notice { color: #8a6d3b; font-size: 13px; }
</style>
</head>
<body>
  <form class="card" method="post" action="${path}/login">
    <h1>队列仪表盘登录</h1>
    ${notice}${errorHtml}
    <label for="email">邮箱</label>
    <input id="email" name="email" type="email" autocomplete="username" required>
    <label for="password">密码</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>
    <button type="submit">登录</button>
  </form>
</body>
</html>`;
}
