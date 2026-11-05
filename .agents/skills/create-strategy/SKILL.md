---
name: create-strategy
description: 生成微信订阅消息业务策略（strategy）。用于新增模板消息、新增推送业务、添加 strategy：先校验 appId/secret/name/templateId/fields/dataKeys 是否齐全，缺失时给出补齐清单；再生成策略类、注册到 StrategyModule、更新 config/apps.yaml；最后输出调用方请求与回调的数据结构。
---

# 生成策略模块（create-strategy）

把一个微信订阅消息模板接入本服务，交付五样东西：**策略类、注册、配置、测试、调用方数据结构**。

## 触发

用户要“新增模板消息 / 加一个推送业务 / 写个 strategy / 接入某个模板”时。

## 步骤

### 1. 采集并校验输入

先按清单向用户要信息；缺项列出来，等补齐再继续。

**必需**

| 项 | 含义 | 示例 |
|----|------|------|
| `appId` | 小程序 appid | `wx1ab5ceabc337ef6c` |
| `secret` | 小程序 secret | `6793e2d5...` |
| `name` | 小程序名称 | `课时记录` |
| `scenario` | 业务场景（英文 PascalCase） | `CourseRemind`（上课提醒） |
| `templateId` | 微信订阅消息模板 ID | `FgPoaf3IGz6HmzZlFzT34fQux7bNOwdMqF4sQHnIPpA` |
| `fields` | 模板字段 → 中文标签 | `{ thing17: '课程名称', time15: '上课时间' }` |
| `dataKeys` | 业务 data key → 模板字段 | `{ courseName: 'thing17', classTime: 'time15' }` |

**可选**：默认 `page`、默认 `callback.url`、`miniprogramState`、`lang`、必填字段校验规则。

**校验规则**

- `appId` 匹配 `^wx[0-9a-f]{16}$`。
- `templateId` 非空；若已在其他 app 下出现，提示确认。
- `fields` 的每个 key 匹配 `^(thing|time|name|number|phrase|date|amount|character_string|phone_number|car_number|const)\d+$`，且都有中文标签。
- `dataKeys` 覆盖每个模板字段；未提供时按标签推导 camelCase，并向用户确认。
- `scenario` 能转成合法 PascalCase 类名（中文场景名要求先给英文名）。

**缺失时**：输出「缺失项 + 补齐模板」，等用户补齐。不要猜。

补齐模板：

```yaml
appId: wx...
secret: ...
name: 小程序名
scenario: CourseRemind
templateId: ...
fields:
  thing17: 课程名称
  time15: 上课时间
dataKeys:        # 可选
  courseName: thing17
  classTime: time15
```

**完成标准**：必需项齐全且通过校验；或已明确列出缺失项与补齐模板。

### 2. 检查 config/apps.yaml

- `appId` 未配置 → 追加账户块（`appId` / `name` / `secret` / `templates`）。
- `appId` 已配置但 `templateId` 不在 `templates` → 追加模板条目。
- `templateId` 已存在 → 告知用户，确认“更新 / 跳过”。
- 同一 `templateId` 出现在多个 app → 提示确认。

**完成标准**：`config/apps.yaml` 中该 `appId` 与 `templateId` 均存在且唯一。

### 3. 生成策略类

路径：`src/strategy/strategies/<appId>/<scenario-kebab>.strategy.ts`

```ts
import { Injectable } from '@nestjs/common';
import {
  PushContext,
  PushStrategy,
  WechatSubscribeData,
} from '../../push-strategy.interface';

@Injectable()
export class CourseRemindStrategy implements PushStrategy {
  readonly templateId = '<templateId>';

  match(_appId: string, templateId: string): boolean {
    return templateId === this.templateId;
  }

  buildWechatData(ctx: PushContext): WechatSubscribeData {
    const data = ctx.data;

    return {
      thing17: { value: this.pick(data, 'courseName', 'thing17') },
      time15: { value: this.pick(data, 'classTime', 'time15') },
    };
  }

  private pick(data: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }
    return '';
  }
}
```

规则：

- `buildWechatData` 覆盖 `fields` 的每个模板字段。
- `pick` 同时接受业务 key 与模板 key，调用方两种写法都能用。
- 需要必填 / 长度校验时加 `validate(data)`，失败即终态。

**完成标准**：策略类文件生成，字段映射与 `fields` 一一对应。

### 4. 注册策略

修改 `src/strategy/strategy.module.ts`：

1. import 新策略；
2. `providers` 增加；
3. `PUSH_STRATEGIES` 工厂的 `inject` 与返回数组增加。

**完成标准**：`StrategyModule` 能编译，`PUSH_STRATEGIES` 数组包含新策略。

### 5. 补测试

`src/strategy/strategies/<appId>/<scenario-kebab>.strategy.spec.ts`：

- `match` 命中 / 未命中；
- `buildWechatData` 两种输入（业务 key、模板 key）。

**完成标准**：`pnpm run test` 通过。

### 6. 输出调用方数据结构

向用户交付以下内容，作为另一个系统的对接依据。

**请求**

```jsonc
{
  "requestId": "全局唯一幂等键",
  "appId": "<appId>",
  "templateId": "<templateId>",
  "openid": "<用户 openid>",
  "data": {
    "<业务 key>": "..."
  },
  "page": "<可选>",
  "miniprogramState": "formal",
  "callbackUrl": "<可选>"
}
```

**示例**

```bash
curl -X POST http://<host>/push/send \
  -H 'Content-Type: application/json' \
  -d '{
    "requestId": "req-1",
    "appId": "<appId>",
    "templateId": "<templateId>",
    "openid": "<openid>",
    "data": { "<业务 key>": "..." }
  }'
```

**回调**（对方做状态变更）

```jsonc
{
  "requestId": "req-1",
  "appId": "<appId>",
  "templateId": "<templateId>",
  "openid": "<openid>",
  "result": "sent | refused | failed | exhausted",
  "errcode": 0,
  "errmsg": "ok",
  "timestamp": "2026-10-26T22:00:00.000Z"
}
```

**调用方须知**

- `requestId` 幂等：同 `appId + requestId` 只入队一次。
- `openid` 必须已订阅该模板，否则 `43101`（拒收，不重试）。
- `data` 用 `dataKeys` 约定的业务 key，或直接传模板字段名。
- 接口返回 `202` 即入队；结果走回调，不阻塞。

**完成标准**：以上四块已输出，且 `data` key 与策略映射一致。

### 7. 验证

- `pnpm run lint`
- `pnpm run build`
- `pnpm run test`

可选入队冒烟：暂停队列 → `POST /push/send` → `getJob('appId_requestId')` 校验 → 恢复。

**完成标准**：lint / build / test 全绿。

### 8. 落盘

- `docs/changelog/CHANGELOG.md` 追加 `- [strategy] ...`。
- 配置变更同步到 `config/apps.yaml`。

**完成标准**：变更日志已记录。

## 相关位置

| 内容 | 路径 |
|------|------|
| 策略接口 | `src/strategy/push-strategy.interface.ts` |
| 注册表 | `src/strategy/strategy.registry.ts` |
| 注册处 | `src/strategy/strategy.module.ts` |
| 策略目录 | `src/strategy/strategies/<appId>/` |
| 账户配置 | `config/apps.yaml` |
| 请求 DTO | `src/push/dto/push-subscribe.dto.ts` |
| 入口 | `POST /push/send` |
