import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ChildAccount } from '../../child/entities/child-account.entity';
import { MemberLevel } from '../enums/member-level.enum';
import { FamilyMember } from './family-member.entity';

@Entity('family_group')
export class FamilyGroup extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'group_code', length: 6 })
  groupCode: string;

  @Column({
    name: 'member_level',
    type: 'tinyint',
    default: MemberLevel.Free,
  })
  memberLevel: MemberLevel;

  @Column({ name: 'vip_expire_time', type: 'datetime', nullable: true })
  vipExpireTime: Date | null;

  @OneToMany(() => FamilyMember, (member) => member.group)
  members: FamilyMember[];

  @OneToMany(() => ChildAccount, (child) => child.group)
  children: ChildAccount[];
}
