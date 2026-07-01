import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FamilyMember } from '@/modules/family/entities/family-member.entity';

@Entity('wechat_subscription')
export class WechatSubscription {
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: string;

  @Column({ name: 'template_id', length: 100 })
  templateId: string;

  @Column({ name: 'remaining_count', type: 'int', default: 0 })
  remainingCount: number;

  @ManyToOne(() => FamilyMember, (member) => member.subscriptions)
  @JoinColumn({ name: 'member_id' })
  member: FamilyMember;

  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
