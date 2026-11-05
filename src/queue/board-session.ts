import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const BOARD_SESSION_COOKIE = 'board_session';
export const BOARD_SESSION_TTL_SEC = 12 * 60 * 60;

/** 定长哈希后 timingSafeEqual 比较，避免长度与比较时序泄露。 */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * 无状态会话：Cookie 值为 `过期时间.HMAC(过期时间)`。
 * 密钥来自 BULL_BOARD_SESSION_SECRET；密钥不变时重启后旧会话仍有效。
 */
export class BoardSession {
  constructor(private readonly secret: string) {}

  issue(): string {
    const expiresAt = Date.now() + BOARD_SESSION_TTL_SEC * 1000;
    return `${expiresAt}.${this.sign(String(expiresAt))}`;
  }

  verify(cookieValue: string | undefined): boolean {
    if (!cookieValue) return false;
    const sep = cookieValue.indexOf('.');
    if (sep <= 0) return false;
    const expiresAt = cookieValue.slice(0, sep);
    const signature = cookieValue.slice(sep + 1);
    if (!/^\d+$/.test(expiresAt)) return false;
    if (!safeEqual(this.sign(expiresAt), signature)) return false;
    return Number(expiresAt) > Date.now();
  }

  private sign(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('hex');
  }
}
