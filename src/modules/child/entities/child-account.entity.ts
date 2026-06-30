import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CoursePackage } from '../../course/entities/course-package.entity';
import { FamilyGroup } from '../../family/entities/family-group.entity';

@Entity('child_account')
export class ChildAccount extends BaseEntity {
  @Column({ name: 'group_id', type: 'bigint' })
  groupId: string;

  @Column({ name: 'child_name', length: 64 })
  childName: string;

  @Column({ name: 'theme_color', length: 20 })
  themeColor: string;

  @ManyToOne(() => FamilyGroup, (group) => group.children)
  @JoinColumn({ name: 'group_id' })
  group: FamilyGroup;

  @OneToMany(() => CoursePackage, (pkg) => pkg.child)
  coursePackages: CoursePackage[];
}
