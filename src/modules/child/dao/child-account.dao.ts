import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChildAccount } from '../entities/child-account.entity';
import { BaseDao } from '@/common/dao/base.dao';

@Injectable()
export class ChildAccountDao extends BaseDao<ChildAccount> {
  constructor(
    @InjectRepository(ChildAccount)
    repository: Repository<ChildAccount>,
  ) {
    super(repository);
  }

  // 复杂查询方法（按需添加）
  async findByGroupId(groupId: string): Promise<ChildAccount[]> {
    return this.repository.find({
      where: { groupId },
      relations: { group: true } as any,
    });
  }
}
