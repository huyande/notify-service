import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { FamilyMember } from '../../family/entities/family-member.entity';

@Entity('wechat_subscription')
export class WechatSubscription extends BaseEntity {
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: string;

  @Column({ name: 'template_id', length: 100 })
  templateId: string;

  @Column({ name: 'remaining_count', type: 'int', default: 0 })
  remainingCount: number;

  @ManyToOne(() => FamilyMember, (member) => member.subscriptions)
  @JoinColumn({ name: 'member_id' })
  member: FamilyMember;
}
