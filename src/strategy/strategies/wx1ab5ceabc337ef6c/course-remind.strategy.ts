import { Injectable } from '@nestjs/common';
import {
  PushContext,
  PushStrategy,
  WechatSubscribeData,
} from '../../push-strategy.interface';

/**
 * 上课提醒（课时记录小程序）。
 *
 * 模板字段：thing17 课程名称 / time15 上课时间 / thing4 事项地点 / name1 提醒人。
 *
 * 业务 data 约定（同时兼容直接传模板字段名）：
 * - `courseName`   课程名称
 * - `classTime`    上课时间
 * - `location`     事项地点
 * - `reminderName` 提醒人
 */
@Injectable()
export class CourseRemindStrategy implements PushStrategy {
  readonly templateId = 'FgPoaf3IGz6HmzZlFzT34fQux7bNOwdMqF4sQHnIPpA';

  match(_appId: string, templateId: string): boolean {
    return templateId === this.templateId;
  }

  buildWechatData(ctx: PushContext): WechatSubscribeData {
    const data = ctx.data;

    return {
      thing17: { value: this.pick(data, 'courseName', 'thing17') || '课程' },
      time15: { value: this.pick(data, 'classTime', 'time15') },
      thing4: { value: this.pick(data, 'location', 'thing4') },
      name1: { value: this.pick(data, 'reminderName', 'name1') },
    };
  }

  private pick(data: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }
    return '';
  }
}
