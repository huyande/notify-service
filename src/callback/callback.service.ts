import { Injectable, Logger } from '@nestjs/common';

export type CallbackResult = 'sent' | 'refused' | 'failed' | 'exhausted';

export interface CallbackPayload {
  requestId: string;
  appId: string;
  templateId: string;
  openid: string;
  result: CallbackResult;
  errcode: number;
  errmsg: string;
  timestamp: string;
}

@Injectable()
export class CallbackService {
  private readonly logger = new Logger(CallbackService.name);

  /**
   * fire-and-forget：不 await、不重试，失败仅记日志；无地址时直接跳过。
   */
  fireAndForget(url: string | undefined, payload: CallbackPayload): void {
    if (!url) {
      return;
    }

    try {
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((error: unknown) => {
        this.logger.warn(
          `callback failed url=${url} error=${(error as Error).message}`,
        );
      });
    } catch (error) {
      this.logger.warn(
        `callback dispatch failed url=${url} error=${(error as Error).message}`,
      );
    }
  }
}
