import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppsModule } from './app/apps.module';
import { CallbackModule } from './callback/callback.module';
import { PushModule } from './push/push.module';
import { QueueModule } from './queue/queue.module';
import { BullBoardDashboardModule } from './queue/bull-board.module';
import { RedisModule } from './redis/redis.module';
import { StrategyModule } from './strategy/strategy.module';
import { WechatModule } from './wechat/wechat.module';

@Module({
  imports: [
    AppConfigModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: Number(config.get<string>('REDIS_PORT', '6379')),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          maxRetriesPerRequest: null,
        },
      }),
    }),
    RedisModule,
    AppsModule,
    StrategyModule,
    WechatModule,
    CallbackModule,
    QueueModule,
    PushModule,
    BullBoardDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
