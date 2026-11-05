import { Injectable, Logger } from '@nestjs/common';
import { AppRegistry } from '../app/app.registry';
import { TokenCache } from './token.cache';
import { WechatClient, WechatSendResponse } from './wechat.client';

export type SendResultKind = 'success' | 'refused' | 'failed';

export interface SendOutcome {
  kind: SendResultKind;
  /** 是否值得重试（网络类 / 频率超限 / token 失效）。 */
  retryable: boolean;
  errcode: number;
  errmsg: string;
}

/** 可重试的微信错误码：频率超限、token 失效。 */
const TRANSIENT_CODES = new Set([40001, 45009]);
/** 用户拒收：终态，不重试。 */
const REFUSED_CODES = new Set([43101]);

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);

  constructor(
    private readonly appRegistry: AppRegistry,
    private readonly tokenCache: TokenCache,
    private readonly client: WechatClient,
  ) {}

  async getAccessToken(appId: string): Promise<string> {
    const cached = await this.tokenCache.get(appId);
    if (cached) {
      return cached;
    }
    return this.refreshAccessToken(appId);
  }

  private async refreshAccessToken(appId: string): Promise<string> {
    const app = this.appRegistry.get(appId);
    if (!app) {
      throw new Error(`Unknown appId: ${appId}`);
    }
    const { accessToken, expiresIn } = await this.client.fetchAccessToken(
      app.appId,
      app.secret,
    );
    await this.tokenCache.set(appId, accessToken, expiresIn);
    return accessToken;
  }

  async send(
    appId: string,
    payload: Record<string, unknown>,
  ): Promise<SendOutcome> {
    let token = await this.getAccessToken(appId);
    let response = await this.client.sendSubscribeMessage(token, payload);

    // token 失效：清缓存、刷新后重试一次。
    if (response.errcode === 40001) {
      this.logger.warn(
        `access_token invalid for ${appId}, refreshing and retrying`,
      );
      await this.tokenCache.del(appId);
      token = await this.refreshAccessToken(appId);
      response = await this.client.sendSubscribeMessage(token, payload);
    }

    return this.classify(response);
  }

  private classify(response: WechatSendResponse): SendOutcome {
    const { errcode, errmsg } = response;

    if (errcode === 0) {
      return { kind: 'success', retryable: false, errcode, errmsg };
    }
    if (REFUSED_CODES.has(errcode)) {
      return { kind: 'refused', retryable: false, errcode, errmsg };
    }
    if (TRANSIENT_CODES.has(errcode)) {
      return { kind: 'failed', retryable: true, errcode, errmsg };
    }
    return { kind: 'failed', retryable: false, errcode, errmsg };
  }
}
