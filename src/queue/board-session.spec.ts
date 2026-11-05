import { BoardSession } from './board-session';

describe('BoardSession', () => {
  it('round-trips an issued session', () => {
    const session = new BoardSession('secret');

    expect(session.verify(session.issue())).toBe(true);
  });

  it('rejects tampered, forged and expired sessions', () => {
    const session = new BoardSession('secret');
    const valid = session.issue();
    const [expiresAt] = valid.split('.');

    expect(session.verify(`${Number(expiresAt) + 1000}.${valid.split('.')[1]}`)).toBe(false);
    expect(session.verify('1234567890.deadbeef')).toBe(false);
    expect(session.verify(undefined)).toBe(false);
    expect(session.verify('not-a-session')).toBe(false);

    const other = new BoardSession('other-secret');
    expect(other.verify(valid)).toBe(false);
  });

  it('rejects an expired session signed with the right key', () => {
    const session = new BoardSession('secret');
    // 直接构造一个已过期但签名合法的会话，验证过期校验独立于签名校验。
    const expiredAt = Date.now() - 1000;
    const forged = `${expiredAt}.${session['sign'](String(expiredAt))}`;

    expect(session.verify(forged)).toBe(false);
  });
});
