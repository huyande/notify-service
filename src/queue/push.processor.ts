import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { AppRegistry } from '../app/app.registry';
import { CallbackResult, CallbackService } from '../callback/callback.service';
import { PushContext } from '../strategy/push-strategy.interface';
import { StrategyRegistry } from '../strategy/strategy.registry';
import { WechatService } from '../wechat/wechat.service';
import { PUSH_QUEUE } from './queue.constants';

/** 任务终态结果，写入 job.returnValue，Bull Board 可直接区分 sent/refused/failed。 */
export interface PushJobResult {
  result: CallbackResult;
  errcode: number;
  errmsg: string;
}

@Processor(PUSH_QUEUE, {
  concurrency: 5,
  limiter: { max: 100, duration: 60_000 },
})
export class PushProcessor extends WorkerHost {
  private readonly logger = new Logger(PushProcessor.name);

  constructor(
    private readonly appRegistry: AppRegistry,
    private readonly strategies: StrategyRegistry,
    private readonly wechat: WechatService,
    private readonly callback: CallbackService,
  ) {
    super();
  }

  async process(job: Job<PushContext>): Promise<PushJobResult> {
    const ctx = job.data;
    const startedAt = Date.now();

    // 1. 业务策略路由（按 templateId）
    const strategy = this.strategies.get(ctx.appId, ctx.templateId);
    if (!strategy) {
      const errmsg = `No strategy registered for template ${ctx.templateId}`;
      this.finish(ctx, 'failed', -1, errmsg);
      return { result: 'failed', errcode: -1, errmsg };
    }

    // 2. 业务数据校验 + 组装为微信字段（失败为终态）
    let data;
    try {
      strategy.validate?.(ctx.data);
      data = strategy.buildWechatData(ctx);
    } catch (error) {
      const errmsg = (error as Error).message;
      this.finish(ctx, 'failed', -1, errmsg);
      return { result: 'failed', errcode: -1, errmsg };
    }

    // 3. 发送订阅消息
    const outcome = await this.wechat.send(ctx.appId, {
      touser: ctx.openid,
      template_id: ctx.templateId,
      page: ctx.page,
      miniprogram_state: ctx.miniprogramState,
      lang: ctx.lang,
      data,
    });

    // 4. 结果分类：可重试错误抛出，交由 BullMQ 退避重试
    if (outcome.retryable) {
      throw new Error(
        `WeChat transient error ${outcome.errcode}: ${outcome.errmsg}`,
      );
    }

    const result: CallbackResult =
      outcome.kind === 'success'
        ? 'sent'
        : outcome.kind === 'refused'
          ? 'refused'
          : 'failed';

    this.logger.log(
      `push ${result} requestId=${ctx.requestId} appId=${ctx.appId} templateId=${ctx.templateId} openid=${ctx.openid} errcode=${outcome.errcode} elapsed=${Date.now() - startedAt}ms`,
    );

    this.finish(ctx, result, outcome.errcode, outcome.errmsg);
    return { result, errcode: outcome.errcode, errmsg: outcome.errmsg };
  }

  /**
   * 重试超限（已进入 failed / 死信）时回调 exhausted。
   * BullMQ 在 moveToFailed 后先自增 attemptsMade 再触发 failed 事件，
   * 因此 attemptsMade >= attempts 即可判定为最后一次尝试。
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job<PushContext> | undefined, error: Error): void {
    if (!job) {
      return;
    }
    const attempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < attempts) {
      return; // 仍会重试
    }

    this.logger.warn(
      `push exhausted requestId=${job.data.requestId} appId=${job.data.appId} error=${error?.message}`,
    );
    this.finish(job.data, 'exhausted', -1, error?.message ?? 'retry exhausted');
  }

  private finish(
    ctx: PushContext,
    result: CallbackResult,
    errcode: number,
    errmsg: string,
  ): void {
    const url = this.appRegistry.resolveCallbackUrl(ctx.appId, ctx.callbackUrl);
    if (!url) {
      return;
    }

    this.callback.fireAndForget(url, {
      requestId: ctx.requestId,
      appId: ctx.appId,
      templateId: ctx.templateId,
      openid: ctx.openid,
      result,
      errcode,
      errmsg,
      timestamp: new Date().toISOString(),
    });
  }
}
