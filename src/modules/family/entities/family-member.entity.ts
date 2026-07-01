import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ClassChangeLog } from '../../lesson-log/entities/class-change-log.entity';
import { WechatSubscription } from '../../notification/entities/wechat-subscription.entity';
import { MemberRole } from '../enums/member-role.enum';
import { FamilyGroup } from './family-group.entity';

@Entity('family_member')
export class FamilyMember extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'open_id', length: 64 })
  openId: string;

  @Column({ name: 'group_id', type: 'bigint' })
  groupId: string;

  @Column({ name: 'role', type: 'tinyint' })
  role: MemberRole;

  @Column({ name: 'nickname', length: 64 })
  nickname: string;

  @Column({ name: 'avatar_url', length: 255 })
  avatarUrl: string;

  @Column({ name: 'is_remind_enabled', type: 'tinyint', default: 1 })
  isRemindEnabled: number;

  @Column({ name: 'join_time', type: 'datetime' })
  joinTime: Date;

  @Column({ name: 'refresh_token', length: 512, nullable: true })
  refreshToken: string | null;

  @Column({ name: 'token_expires_at', type: 'datetime', nullable: true })
  tokenExpiresAt: Date | null;

  @ManyToOne(() => FamilyGroup, (group) => group.members)
  @JoinColumn({ name: 'group_id' })
  group: FamilyGroup;

  @OneToMany(() => WechatSubscription, (subscription) => subscription.member)
  subscriptions: WechatSubscription[];

  @OneToMany(() => ClassChangeLog, (log) => log.operator)
  changeLogs: ClassChangeLog[];
}
