import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TimeBranch } from '../enums/time-branch.enum';
import { CoursePackage } from './course-package.entity';

@Entity('course_time_rule')
export class CourseTimeRule extends BaseEntity {
  @Column({ name: 'package_id', type: 'bigint' })
  packageId: string;

  @Column({ name: 'week_day', type: 'tinyint' })
  weekDay: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'time_branch', type: 'tinyint' })
  timeBranch: TimeBranch;

  @Column({ name: 'is_finished', type: 'tinyint', default: 0 })
  isFinished: number;

  @ManyToOne(() => CoursePackage, (pkg) => pkg.timeRules)
  @JoinColumn({ name: 'package_id' })
  package: CoursePackage;
}
