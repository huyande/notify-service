import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChildAccount } from '@/modules/child/entities/child-account.entity';
import { ClassChangeLog } from '@/modules/lesson-log/entities/class-change-log.entity';
import { CourseTimeRule } from './course-time-rule.entity';

@Entity('course_package')
export class CoursePackage {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'child_id', type: 'bigint' })
  childId: string;

  @Column({ name: 'course_name', length: 64 })
  courseName: string;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string;

  @Column({ name: 'total_lessons', type: 'decimal', precision: 10, scale: 2 })
  totalLessons: string;

  @Column({ name: 'remain_lessons', type: 'decimal', precision: 10, scale: 2 })
  remainLessons: string;

  @Column({ name: 'is_auto_deduct', type: 'tinyint', default: 0 })
  isAutoDeduct: number;

  @Column({
    name: 'deduct_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: '1.00',
  })
  deductAmount: string;

  @Column({ name: 'card_color', length: 7 })
  cardColor: string;

  @Column({ name: 'remind_rule', type: 'varchar', length: 64, nullable: true })
  remindRule: string | null;

  @ManyToOne(() => ChildAccount, (child) => child.coursePackages)
  @JoinColumn({ name: 'child_id' })
  child: ChildAccount;

  @OneToMany(() => CourseTimeRule, (rule) => rule.package)
  timeRules: CourseTimeRule[];

  @OneToMany(() => ClassChangeLog, (log) => log.package)
  changeLogs: ClassChangeLog[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
