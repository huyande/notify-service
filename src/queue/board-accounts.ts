import { safeEqual } from './board-session';

/**
 * Bull Board 登录账户白名单。
 * 来源：环境变量 BULL_BOARD_ACCOUNTS，格式 `email:password,email:password`。
 * 限制：密码不得包含逗号或冒号；邮箱大小写不敏感。
 */
export class BoardAccounts {
  private readonly users = new Map<string, string>();

  constructor(raw: string | undefined) {
    for (const pair of (raw ?? '').split(',')) {
      const entry = pair.trim();
      if (!entry) continue;
      const sep = entry.indexOf(':');
      if (sep <= 0 || sep === entry.length - 1) continue;
      this.users.set(entry.slice(0, sep).trim().toLowerCase(), entry.slice(sep + 1));
    }
  }

  /** 是否配置了至少一个账户；未配置时任何人都无法登录。 */
  get configured(): boolean {
    return this.users.size > 0;
  }

  verify(email: string | undefined, password: string | undefined): boolean {
    const expected = this.users.get((email ?? '').trim().toLowerCase());
    if (expected === undefined || typeof password !== 'string') return false;
    return safeEqual(expected, password);
  }
}

