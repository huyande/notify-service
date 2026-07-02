import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseTimeRule } from '../entities/course-time-rule.entity';
import { BaseDao } from '@/common/dao/base.dao';

@Injectable()
export class CourseTimeRuleDao extends BaseDao<CourseTimeRule> {
  constructor(
    @InjectRepository(CourseTimeRule)
    repository: Repository<CourseTimeRule>,
  ) {
    super(repository);
  }

  async findByPackageId(packageId: string): Promise<CourseTimeRule[]> {
    return this.repository.find({
      where: { packageId },
    });
  }
}
