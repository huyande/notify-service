/**
 * 一次推送的运行时上下文（由 HTTP 请求体传入，作为队列任务载荷）。
 */
export interface PushContext {
  requestId: string;
  appId: string;
  templateId: string;
  openid: string;
  data: Record<string, unknown>;
  page?: string;
  miniprogramState?: string;
  lang?: string;
  callbackUrl?: string;
}

/**
 * 微信订阅消息 data 字段格式：{ thing1: { value: '...' }, ... }
 */
export interface WechatSubscribeData {
  [key: string]: { value: string };
}

/**
 * 业务策略：每个业务/模板实现一个策略类，负责把业务 data 组装为微信字段。
 */
export interface PushStrategy {
  /** 该策略处理的模板 ID（业务路由 key）。 */
  readonly templateId: string;

  /** 校验该 appId + templateId 是否由本策略处理。 */
  match(appId: string, templateId: string): boolean;

  /** 业务 data → 微信订阅消息 data。 */
  buildWechatData(ctx: PushContext): WechatSubscribeData;

  /** 可选的业务数据校验，失败即终态。 */
  validate?(data: Record<string, unknown>): void;
}
