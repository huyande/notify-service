import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppsModule } from '../app/apps.module';
import { CallbackModule } from '../callback/callback.module';
import { StrategyModule } from '../strategy/strategy.module';
import { WechatModule } from '../wechat/wechat.module';
import { PUSH_QUEUE } from './queue.constants';
import { PushProcessor } from './push.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: PUSH_QUEUE }),
    AppsModule,
    StrategyModule,
    WechatModule,
    CallbackModule,
  ],
  providers: [PushProcessor],
})
export class QueueModule {}
