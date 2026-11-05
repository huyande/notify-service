import { Global, Module } from '@nestjs/common';
import { REDIS_CONNECTION, redisProvider } from './redis.provider';

@Global()
@Module({
  providers: [redisProvider],
  exports: [REDIS_CONNECTION],
})
export class RedisModule {}
