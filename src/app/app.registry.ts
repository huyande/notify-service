import { AppConfig } from './app-config.interface';

/**
 * 多小程序账户注册表，按 appId 隔离查询与回调地址解析。
 */
export class AppRegistry {
  private readonly apps: Map<string, AppConfig>;

  constructor(configs: AppConfig[]) {
    this.apps = new Map(configs.map((app) => [app.appId, app]));
  }

  get(appId: string): AppConfig | undefined {
    return this.apps.get(appId);
  }

  has(appId: string): boolean {
    return this.apps.has(appId);
  }

  list(): AppConfig[] {
    return [...this.apps.values()];
  }

  /**
   * 回调地址：请求体中的 callbackUrl 优先，否则回落到该小程序的静态配置。
   */
  resolveCallbackUrl(
    appId: string,
    requestCallbackUrl?: string,
  ): string | undefined {
    return requestCallbackUrl ?? this.apps.get(appId)?.callback?.url;
  }
}
