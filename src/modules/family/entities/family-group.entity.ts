import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChildAccount } from '@/modules/child/entities/child-account.entity';
import { MemberLevel } from '../enums/member-level.enum';
import { FamilyMember } from './family-member.entity';

@Entity('family_group')
export class FamilyGroup {
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

  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
