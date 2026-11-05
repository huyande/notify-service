import { CourseRemindStrategy } from './course-remind.strategy';

const TEMPLATE_ID = 'FgPoaf3IGz6HmzZlFzT34fQux7bNOwdMqF4sQHnIPpA';
const APP_ID = 'wx1ab5ceabc337ef6c';

describe('CourseRemindStrategy', () => {
  const strategy = new CourseRemindStrategy();

  it('matches its templateId', () => {
    expect(strategy.templateId).toBe(TEMPLATE_ID);
    expect(strategy.match(APP_ID, TEMPLATE_ID)).toBe(true);
    expect(strategy.match(APP_ID, 'other')).toBe(false);
  });

  it('maps business data to wechat template fields', () => {
    const data = strategy.buildWechatData({
      requestId: 'r1',
      appId: APP_ID,
      templateId: TEMPLATE_ID,
      openid: 'o1',
      data: {
        courseName: '数学',
        classTime: '2026-10-27 19:00',
        location: '教室 A',
        reminderName: '张老师',
      },
    });

    expect(data).toEqual({
      thing17: { value: '数学' },
      time15: { value: '2026-10-27 19:00' },
      thing4: { value: '教室 A' },
      name1: { value: '张老师' },
    });
  });

  it('also accepts template field keys directly', () => {
    const data = strategy.buildWechatData({
      requestId: 'r2',
      appId: APP_ID,
      templateId: TEMPLATE_ID,
      openid: 'o2',
      data: {
        thing17: '英语',
        time15: '2026-10-28 20:00',
        thing4: '线上',
        name1: '李老师',
      },
    });

    expect(data).toEqual({
      thing17: { value: '英语' },
      time15: { value: '2026-10-28 20:00' },
      thing4: { value: '线上' },
      name1: { value: '李老师' },
    });
  });
});
