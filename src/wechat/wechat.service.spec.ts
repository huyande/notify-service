import { AppRegistry } from '../app/app.registry';
import { TokenCache } from './token.cache';
import { WechatClient } from './wechat.client';
import { WechatService } from './wechat.service';

describe('WechatService', () => {
  let tokenCache: jest.Mocked<TokenCache>;
  let client: jest.Mocked<WechatClient>;
  let service: WechatService;

  beforeEach(() => {
    const appRegistry = new AppRegistry([
      { appId: 'wx1', name: 'A', secret: 's1' },
    ]);
    tokenCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<TokenCache>;
    client = {
      fetchAccessToken: jest.fn(),
      sendSubscribeMessage: jest.fn(),
    };
    service = new WechatService(appRegistry, tokenCache, client);
  });

  it('uses cached token without fetching', async () => {
    tokenCache.get.mockResolvedValue('cached-token');
    client.sendSubscribeMessage.mockResolvedValue({ errcode: 0, errmsg: 'ok' });

    const outcome = await service.send('wx1', {});

    expect(client.fetchAccessToken).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({ kind: 'success', retryable: false });
  });

  it('refreshes token on cache miss', async () => {
    tokenCache.get.mockResolvedValue(null);
    client.fetchAccessToken.mockResolvedValue({
      accessToken: 'new-token',
      expiresIn: 7200,
    });
    client.sendSubscribeMessage.mockResolvedValue({ errcode: 0, errmsg: 'ok' });

    await service.send('wx1', {});

    expect(client.fetchAccessToken).toHaveBeenCalledWith('wx1', 's1');
    expect(tokenCache.set).toHaveBeenCalledWith('wx1', 'new-token', 7200);
  });

  it('classifies 43101 as refused and non-retryable', async () => {
    tokenCache.get.mockResolvedValue('t');
    client.sendSubscribeMessage.mockResolvedValue({
      errcode: 43101,
      errmsg: 'refused',
    });

    const outcome = await service.send('wx1', {});

    expect(outcome).toMatchObject({
      kind: 'refused',
      retryable: false,
      errcode: 43101,
    });
  });

  it('classifies 45009 as retryable failure', async () => {
    tokenCache.get.mockResolvedValue('t');
    client.sendSubscribeMessage.mockResolvedValue({
      errcode: 45009,
      errmsg: 'rate limit',
    });

    const outcome = await service.send('wx1', {});

    expect(outcome).toMatchObject({
      kind: 'failed',
      retryable: true,
      errcode: 45009,
    });
  });

  it('refreshes token once on 40001 and retries', async () => {
    tokenCache.get.mockResolvedValue('expired');
    client.sendSubscribeMessage
      .mockResolvedValueOnce({ errcode: 40001, errmsg: 'invalid token' })
      .mockResolvedValueOnce({ errcode: 0, errmsg: 'ok' });
    client.fetchAccessToken.mockResolvedValue({
      accessToken: 'fresh',
      expiresIn: 7200,
    });

    const outcome = await service.send('wx1', {});

    expect(tokenCache.del).toHaveBeenCalledWith('wx1');
    expect(client.fetchAccessToken).toHaveBeenCalledWith('wx1', 's1');
    expect(client.sendSubscribeMessage).toHaveBeenCalledTimes(2);
    expect(outcome.kind).toBe('success');
  });
});
