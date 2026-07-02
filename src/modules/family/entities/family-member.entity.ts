import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassChangeLog } from '@/modules/lesson-log/entities/class-change-log.entity';
import { WechatSubscription } from '@/modules/notification/entities/wechat-subscription.entity';
import { MemberRole } from '../enums/member-role.enum';
import { FamilyGroup } from './family-group.entity';

@Entity('family_member')
export class FamilyMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;
  
  @Index({ unique: true })
  @Column({ name: 'open_id', length: 64 })
  openId: string;

  @Column({ name: 'group_id', type: 'bigint', nullable: true })
  groupId: string | null;

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

  @Column({ name: 'refresh_token', type: 'varchar', length: 512, nullable: true })
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


  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
