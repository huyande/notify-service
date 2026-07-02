import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroup } from '../entities/family-group.entity';
import { BaseDao } from '@/common/dao/base.dao';

@Injectable()
export class FamilyGroupDao extends BaseDao<FamilyGroup> {
  constructor(
    @InjectRepository(FamilyGroup)
    repository: Repository<FamilyGroup>,
  ) {
    super(repository);
  }

  async findByGroupCode(groupCode: string): Promise<FamilyGroup | null> {
    return this.repository.findOne({ where: { groupCode } as any });
  }
}
