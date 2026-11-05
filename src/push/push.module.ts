import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppsModule } from '../app/apps.module';
import { PUSH_QUEUE } from '../queue/queue.constants';
import { PushController } from './push.controller';
import { PushService } from './push.service';

@Module({
  imports: [BullModule.registerQueue({ name: PUSH_QUEUE }), AppsModule],
  controllers: [PushController],
  providers: [PushService],
})
export class PushModule {}
