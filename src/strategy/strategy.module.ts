import { Module } from '@nestjs/common';
import { PushStrategy } from './push-strategy.interface';
import { PUSH_STRATEGIES, StrategyRegistry } from './strategy.registry';
import { CourseRemindStrategy } from './strategies/wx1ab5ceabc337ef6c/course-remind.strategy';
import { DemoStrategy } from './strategies/wx1234567890abcdef/demo.strategy';

@Module({
  providers: [
    DemoStrategy,
    CourseRemindStrategy,
    {
      provide: PUSH_STRATEGIES,
      useFactory: (
        demo: DemoStrategy,
        courseRemind: CourseRemindStrategy,
      ): PushStrategy[] => [demo, courseRemind],
      inject: [DemoStrategy, CourseRemindStrategy],
    },
    StrategyRegistry,
  ],
  exports: [StrategyRegistry],
})
export class StrategyModule {}
