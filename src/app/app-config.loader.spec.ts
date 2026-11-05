import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadAppConfigs } from './app-config.loader';

describe('loadAppConfigs', () => {
  const original = process.env.TEST_WECHAT_SECRET;
  let dir: string;
  let path: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'notify-app-config-'));
    path = join(dir, 'apps.yaml');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    if (original === undefined) delete process.env.TEST_WECHAT_SECRET;
    else process.env.TEST_WECHAT_SECRET = original;
  });

  it('expands environment placeholders before parsing yaml', () => {
    process.env.TEST_WECHAT_SECRET = 'secret-from-env';
    writeFileSync(
      path,
      'apps:\n  - appId: wx1\n    name: A\n    secret: "${TEST_WECHAT_SECRET}"\n',
    );

    expect(loadAppConfigs(path)[0].secret).toBe('secret-from-env');
  });

  it('fails fast when a referenced environment variable is missing', () => {
    delete process.env.TEST_WECHAT_SECRET;
    writeFileSync(
      path,
      'apps:\n  - appId: wx1\n    name: A\n    secret: "${TEST_WECHAT_SECRET}"\n',
    );

    expect(() => loadAppConfigs(path)).toThrow('Missing environment variable TEST_WECHAT_SECRET');
  });
});
