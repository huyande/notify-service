export const PUSH_QUEUE = 'push';

/**
 * BullMQ 自定义 jobId 不允许包含 ':'，这里用 '_' 拼接 appId 与 requestId。
 * 同一 appId + requestId 会得到相同 jobId，从而实现幂等去重。
 */
export function buildJobId(appId: string, requestId: string): string {
  return `${appId}_${requestId}`;
}
