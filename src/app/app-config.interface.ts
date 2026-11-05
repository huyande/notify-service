export interface CallbackConfig {
  url: string;
}

export interface TemplateConfig {
  templateId: string;
  fields?: string[];
}

export interface AppConfig {
  appId: string;
  name: string;
  secret: string;
  callback?: CallbackConfig;
  templates?: TemplateConfig[];
}

export interface AppsFileConfig {
  apps: AppConfig[];
}
