import { Inject, Injectable } from '@nestjs/common';
import { PushStrategy } from './push-strategy.interface';

export const PUSH_STRATEGIES = 'PUSH_STRATEGIES';

/**
 * 强策略注册表：按 templateId 索引，新增业务 = 新增策略类并注册。
 */
@Injectable()
export class StrategyRegistry {
  private readonly byTemplate = new Map<string, PushStrategy>();

  constructor(@Inject(PUSH_STRATEGIES) strategies: PushStrategy[]) {
    for (const strategy of strategies) {
      this.byTemplate.set(strategy.templateId, strategy);
    }
  }

  get(appId: string, templateId: string): PushStrategy | undefined {
    const strategy = this.byTemplate.get(templateId);
    return strategy && strategy.match(appId, templateId) ? strategy : undefined;
  }

  list(): PushStrategy[] {
    return [...this.byTemplate.values()];
  }
}
