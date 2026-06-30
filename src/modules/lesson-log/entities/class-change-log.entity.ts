import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CoursePackage } from '../../course/entities/course-package.entity';
import { FamilyMember } from '../../family/entities/family-member.entity';
import { ActionType } from '../enums/action-type.enum';

@Entity('class_change_log')
export class ClassChangeLog extends BaseEntity {
  @Column({ name: 'package_id', type: 'bigint' })
  packageId: string;

  @Column({ name: 'operator_id', type: 'bigint' })
  operatorId: string;

  @Column({ name: 'action_type', type: 'tinyint' })
  actionType: ActionType;

  @Column({ name: 'lesson_change', type: 'decimal', precision: 10, scale: 2 })
  lessonChange: string;

  @Column({ name: 'reason', length: 255, nullable: true })
  reason: string | null;

  @Column({ name: 'occur_time', type: 'datetime' })
  occurTime: Date;

  @ManyToOne(() => CoursePackage, (pkg) => pkg.changeLogs)
  @JoinColumn({ name: 'package_id' })
  package: CoursePackage;

  @ManyToOne(() => FamilyMember, (member) => member.changeLogs)
  @JoinColumn({ name: 'operator_id' })
  operator: FamilyMember;
}
