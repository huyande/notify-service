import { BoardAccounts } from './board-accounts';

describe('BoardAccounts', () => {
  it('parses multiple email:password pairs and ignores empty segments', () => {
    const accounts = new BoardAccounts(
      'a@example.com:pass1, ,b@example.com:pass2,',
    );

    expect(accounts.configured).toBe(true);
    expect(accounts.verify('a@example.com', 'pass1')).toBe(true);
    expect(accounts.verify('b@example.com', 'pass2')).toBe(true);
  });

  it('matches email case-insensitively but password exactly', () => {
    const accounts = new BoardAccounts('Admin@Example.com:Secret');

    expect(accounts.verify('admin@example.com', 'Secret')).toBe(true);
    expect(accounts.verify('admin@example.com', 'secret')).toBe(false);
  });

  it('rejects unknown email, missing inputs and malformed pairs', () => {
    const accounts = new BoardAccounts('a@example.com:pass1,broken-entry');

    expect(accounts.verify('c@example.com', 'pass1')).toBe(false);
    expect(accounts.verify('a@example.com', undefined)).toBe(false);
    expect(accounts.verify(undefined, 'pass1')).toBe(false);
  });

  it('is unconfigured when the variable is empty or undefined', () => {
    expect(new BoardAccounts(undefined).configured).toBe(false);
    expect(new BoardAccounts('').configured).toBe(false);
  });
});
