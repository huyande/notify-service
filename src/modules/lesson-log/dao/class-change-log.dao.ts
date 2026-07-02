import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassChangeLog } from '../entities/class-change-log.entity';
import { BaseDao } from '@/common/dao/base.dao';

@Injectable()
export class ClassChangeLogDao extends BaseDao<ClassChangeLog> {
  constructor(
    @InjectRepository(ClassChangeLog)
    repository: Repository<ClassChangeLog>,
  ) {
    super(repository);
  }

  async findByPackageId(packageId: string): Promise<ClassChangeLog[]> {
    return this.repository.find({
      where: { packageId },
      relations: { package: true } as any,
      order: { createdAt: 'DESC' },
    });
  }
}
