import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TimeBranch } from '../enums/time-branch.enum';
import { CoursePackage } from './course-package.entity';

@Entity('course_time_rule')
export class CourseTimeRule {
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

  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
