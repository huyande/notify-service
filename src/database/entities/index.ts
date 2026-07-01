import { ChildAccount } from '@/modules/child/entities/child-account.entity';
import { CoursePackage } from '@/modules/course/entities/course-package.entity';
import { CourseTimeRule } from '@/modules/course/entities/course-time-rule.entity';
import { FamilyGroup } from '@/modules/family/entities/family-group.entity';
import { FamilyMember } from '@/modules/family/entities/family-member.entity';
import { ClassChangeLog } from '@/modules/lesson-log/entities/class-change-log.entity';
import { WechatSubscription } from '@/modules/notification/entities/wechat-subscription.entity';

export const ALL_ENTITIES = [
  FamilyGroup,
  FamilyMember,
  ChildAccount,
  CoursePackage,
  CourseTimeRule,
  ClassChangeLog,
  WechatSubscription,
];
