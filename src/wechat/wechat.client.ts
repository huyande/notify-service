import { Injectable } from '@nestjs/common';

const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token';
const SEND_URL = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send';

export interface WechatTokenResponse {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
}

export interface WechatSendResponse {
  errcode: number;
  errmsg: string;
}

/**
 * 微信 HTTP 接口的最小封装（无业务逻辑，便于 mock 测试）。
 */
@Injectable()
export class WechatClient {
  async fetchAccessToken(
    appId: string,
    secret: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const url = `${TOKEN_URL}?grant_type=client_credential&appid=${encodeURIComponent(
      appId,
    )}&secret=${encodeURIComponent(secret)}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`WeChat token endpoint HTTP ${res.status}`);
    }

    const data = (await res.json()) as WechatTokenResponse;
    if (!data.access_token) {
      throw new Error(
        `WeChat token error: ${data.errcode ?? 'unknown'} ${data.errmsg ?? ''}`.trim(),
      );
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in ?? 7200,
    };
  }

  async sendSubscribeMessage(
    accessToken: string,
    payload: Record<string, unknown>,
  ): Promise<WechatSendResponse> {
    const url = `${SEND_URL}?access_token=${encodeURIComponent(accessToken)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`WeChat send endpoint HTTP ${res.status}`);
    }

    return (await res.json()) as WechatSendResponse;
  }
}
