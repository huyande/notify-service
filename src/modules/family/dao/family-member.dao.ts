import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyMember } from '../entities/family-member.entity';
import { BaseDao } from '@/common/dao/base.dao';

@Injectable()
export class FamilyMemberDao extends BaseDao<FamilyMember> {
  constructor(
    @InjectRepository(FamilyMember)
    repository: Repository<FamilyMember>,
  ) {
    super(repository);
  }

  async findByGroupId(groupId: string): Promise<FamilyMember[]> {
    return this.repository.find({
      where: { groupId },
      relations: { group: true } as any,
    });
  }

  async findByOpenId(openId: string): Promise<FamilyMember | null> {
    return this.repository.findOne({ where: { openId } as any });
  }
}
