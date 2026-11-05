import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import { AppConfig, AppsFileConfig } from './app-config.interface';

export const DEFAULT_APPS_CONFIG_PATH = 'config/apps.yaml';

/**
 * 读取并解析静态账户配置（多小程序 appId / secret / 模板 / 回调）。
 */
export function loadAppConfigs(configPath?: string): AppConfig[] {
  const path = resolve(process.cwd(), configPath ?? DEFAULT_APPS_CONFIG_PATH);

  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(
      `Failed to read apps config at ${path}: ${(error as Error).message}`,
    );
  }

  const expanded = raw.replace(/\$\{([A-Z][A-Z0-9_]*)\}/g, (_, name: string) => {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing environment variable ${name} referenced by ${path}`);
    }
    return value;
  });

  const parsed = load(expanded) as AppsFileConfig | undefined;
  if (!parsed || !Array.isArray(parsed.apps)) {
    throw new Error(`Invalid apps config at ${path}: missing "apps" array`);
  }

  return parsed.apps;
}
