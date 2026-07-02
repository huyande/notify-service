import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursePackage } from '../entities/course-package.entity';
import { BaseDao } from '@/common/dao/base.dao';

@Injectable()
export class CoursePackageDao extends BaseDao<CoursePackage> {
  constructor(
    @InjectRepository(CoursePackage)
    repository: Repository<CoursePackage>,
  ) {
    super(repository);
  }

  async findByChildId(childId: string): Promise<CoursePackage[]> {
    return this.repository.find({
      where: { childId },
      relations: { child: true, timeRules: true } as any,
    });
  }
}
