import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CONNECTION } from '../redis/redis.provider';

/** 提前 5 分钟过期，避免临界点使用即将失效的 token。 */
const TOKEN_TTL_BUFFER_SEC = 300;

@Injectable()
export class TokenCache {
  constructor(@Inject(REDIS_CONNECTION) private readonly redis: Redis) {}

  private key(appId: string): string {
    return `wechat:token:${appId}`;
  }

  async get(appId: string): Promise<string | null> {
    return this.redis.get(this.key(appId));
  }

  async set(appId: string, token: string, expiresInSec: number): Promise<void> {
    const ttl = Math.max(expiresInSec - TOKEN_TTL_BUFFER_SEC, 60);
    await this.redis.set(this.key(appId), token, 'EX', ttl);
  }

  async del(appId: string): Promise<void> {
    await this.redis.del(this.key(appId));
  }
}
