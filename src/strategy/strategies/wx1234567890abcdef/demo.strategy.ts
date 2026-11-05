import { Injectable } from '@nestjs/common';
import {
  PushContext,
  PushStrategy,
  WechatSubscribeData,
} from '../../push-strategy.interface';

/**
 * 示例策略：演示业务 data → 微信字段的组装方式，可作为新增业务的样板。
 */
@Injectable()
export class DemoStrategy implements PushStrategy {
  readonly templateId = 'tpl_demo';

  match(_appId: string, templateId: string): boolean {
    return templateId === this.templateId;
  }

  buildWechatData(ctx: PushContext): WechatSubscribeData {
    return {
      thing1: { value: this.asText(ctx.data.title, '通知') },
      time2: { value: this.asText(ctx.data.time) },
    };
  }

  private asText(value: unknown, fallback = ''): string {
    return typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : fallback;
  }
}
