```mermaid
erDiagram
    FAMILY_GROUP ||--o{ FAMILY_MEMBER : "包含(1:N)"
    FAMILY_GROUP ||--o{ CHILD_ACCOUNT : "拥有(1:N)"
    FAMILY_MEMBER ||--o{ WECHAT_SUBSCRIPTION : "授权(1:N)"
    FAMILY_MEMBER ||--o{ CLASS_CHANGE_LOG : "操作(1:N)"
    CHILD_ACCOUNT ||--o{ COURSE_PACKAGE : "报读(1:N)"
    COURSE_PACKAGE ||--o{ COURSE_TIME_RULE : "排课(1:N)"
    COURSE_PACKAGE ||--o{ CLASS_CHANGE_LOG : "产生(1:N)"

    FAMILY_GROUP {
        bigint id PK "家庭组ID"
        varchar(6) group_code "六位随机家庭码(唯一索引)"
        tinyint member_level "会员等级(1:免费版 2:高级会员)"
        datetime vip_expire_time "会员到期时间"
        datetime created_at "创建时间"
        datetime updated_at "最后更新时间"
    }

    FAMILY_MEMBER {
        bigint id PK "成员ID"
        varchar(64) open_id "微信OpenID(唯一索引)"
        bigint group_id FK "关联家庭组ID"
        tinyint role "成员身份(1:创建者 2:被邀请人)"
        varchar(64) nickname "微信昵称"
        varchar(255) avatar_url "微信头像链接"
        tinyint is_remind_enabled "全局消息提醒开关(1:开启 0:关闭)"
        datetime join_time "加入组时间"
        datetime created_at "创建时间"
        datetime updated_at "最后更新时间"
    }

    CHILD_ACCOUNT {
        bigint id PK "孩子账户ID"
        bigint group_id FK "关联家庭组ID"
        varchar(64) child_name "孩子称呼"
        varchar(20) theme_color "孩子专属主题色"
        datetime created_at "创建时间"
        datetime updated_at "最后更新时间"
    }

    COURSE_PACKAGE {
        bigint id PK "课包ID"
        bigint child_id FK "关联孩子ID"
        varchar(64) course_name "课程名称"
        decimal total_price "买课总金额"
        decimal total_lessons "购买总课时数"
        decimal remain_lessons "剩余课时数(实时扣减)"
        tinyint is_auto_deduct "是否自动扣减课时(1:自动 0:手动)"
        decimal deduct_amount "自动扣减数量(如每次自动扣1.0或1.5)"
        varchar(7) card_color "卡片背景色值Hex"
        varchar(64) remind_rule "单独开课提醒设置"
        datetime created_at "创建时间"
        datetime updated_at "最后更新时间"
    }

    COURSE_TIME_RULE {
        bigint id PK "排课规则ID"
        bigint package_id FK "关联课包ID"
        tinyint week_day "周几(1-7)"
        time start_time "上课开始时间"
        time end_time "上课结束时间"
        tinyint time_branch "时段段分类(1:上午 2:下午 3:晚上)"
        tinyint is_finished "是否已完成/失效(1:已结课不在通知 0:活跃，根据remain_lessons变更)"
        datetime created_at "创建时间"
        datetime updated_at "最后更新时间"
    }

    CLASS_CHANGE_LOG {
        bigint id PK "流水ID"
        bigint package_id FK "关联课包ID"
        bigint operator_id FK "操作人成员ID"
        tinyint action_type "变动类型(1:消课 2:请假 3:停课 4:续费)"
        decimal lesson_change "课时变动数(消课-1.0,续费+40.0)"
        varchar(255) reason "备注原因"
        datetime occur_time "对应上课日期时间"
        datetime created_at "创建时间"
        datetime updated_at "最后更新时间"
    }

    WECHAT_SUBSCRIPTION {
        bigint id PK "订阅记录ID"
        bigint member_id FK "接收通知成员ID"
        varchar(100) template_id "微信消息模版ID"
        int remaining_count "可用推送次数"
        datetime created_at "创建时间"
        datetime updated_at "最后更新时间"
    }
```


将项目划分为以下 5 个核心业务模块：

1. 家庭组与成员模块：family
执行命令： nest g resource modules/family

承载数据表： family_group（家庭组表）、family_member（家庭成员表）

业务职责： * 处理微信一键登录与自动建组逻辑。

生成和校验“六位随机家庭码（group_code）”。

处理多成员合并账本、一键邀请、家庭成员列表回显等协同核心逻辑。

2. 孩子账户模块：child
执行命令： nest g resource modules/child

承载数据表： child_account（孩子账户表）

业务职责： * 管理孩子账户的创建、主题色设置。

为首页提供多孩子列表切换的接口。

3. 课程与排课模块：course
执行命令： nest g resource modules/course

承载数据表： course_package（课包表）、course_time_rule（排课规则表）

业务职责： * 核心资产包的录入、剩余价值动态计算。

核心亮点： 负责将底层的 course_time_rule 列表数据，在 Service 层组装成前端需要的 JSON 矩阵格式，用来完美回显【超级课程表】的全周网格。

4. 消课流水账单模块：lesson-log
执行命令： nest g resource modules/lesson-log

承载数据表： class_change_log（消课流水变动表）

业务职责： * 处理核心的“确认消课（-1）”、“标记请假（0）”、“续费充值（+N）”接口。

为详情页的“对账月日历”提供按月份筛选有课/请假圆点的图形化数据接口。

提供5秒内撤销消课的反悔接口。

5. 微信通知与订阅模块：notification
执行命令： nest g resource modules/notification

承载数据表： wechat_subscription（微信订阅记录表）

业务职责： * 接收前端用户点击授权后的订阅次数上报（增加可用次数）。

定时任务宿主（关键）： 配合 NestJS 选型的定时任务插件（如 @nestjs/schedule），每分钟或每小时扫描 course_time_rule，通过高效 SQL 筛选出需要推送的人群，调用微信 Template Message 接口发送开课提醒。
