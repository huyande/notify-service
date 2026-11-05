import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { AppRegistry } from '../app/app.registry';
import { PushContext } from '../strategy/push-strategy.interface';
import { buildJobId, PUSH_QUEUE } from '../queue/queue.constants';
import { PushSubscribeDto } from './dto/push-subscribe.dto';

export interface EnqueueResult {
  requestId: string;
  accepted: true;
}

@Injectable()
export class PushService {
  constructor(
    @InjectQueue(PUSH_QUEUE) private readonly queue: Queue<PushContext>,
    private readonly appRegistry: AppRegistry,
  ) {}

  async enqueue(dto: PushSubscribeDto): Promise<EnqueueResult> {
    if (!this.appRegistry.has(dto.appId)) {
      throw new BadRequestException(
        `小程序 ${dto.appId} 未在 config/apps.yaml 中配置，请先添加该账户配置后重试`,
      );
    }

    const context: PushContext = { ...dto };

    // jobId 幂等：同一 appId + requestId 重复提交不会产生重复任务。
    await this.queue.add('send', context, {
      jobId: buildJobId(dto.appId, dto.requestId),
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 24 * 60 * 60 },
      removeOnFail: { age: 7 * 24 * 60 * 60 },
    });

    return { requestId: dto.requestId, accepted: true };
  }
}
