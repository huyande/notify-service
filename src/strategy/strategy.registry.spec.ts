import { CourseRemindStrategy } from './strategies/wx1ab5ceabc337ef6c/course-remind.strategy';
import { DemoStrategy } from './strategies/wx1234567890abcdef/demo.strategy';
import { StrategyRegistry } from './strategy.registry';

describe('StrategyRegistry', () => {
  const registry = new StrategyRegistry([
    new DemoStrategy(),
    new CourseRemindStrategy(),
  ]);

  it('returns strategy by templateId', () => {
    expect(registry.get('wx1', 'tpl_demo')).toBeInstanceOf(DemoStrategy);
    expect(
      registry.get(
        'wx1ab5ceabc337ef6c',
        'FgPoaf3IGz6HmzZlFzT34fQux7bNOwdMqF4sQHnIPpA',
      ),
    ).toBeInstanceOf(CourseRemindStrategy);
  });

  it('returns undefined for unknown template', () => {
    expect(registry.get('wx1', 'tpl_unknown')).toBeUndefined();
  });

  it('respects strategy match()', () => {
    const strategy = registry.get('wx1', 'tpl_demo');
    expect(strategy?.match('wx1', 'tpl_demo')).toBe(true);
    expect(strategy?.match('wx1', 'other')).toBe(false);
  });
});
