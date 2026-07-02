import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatSubscription } from '../entities/wechat-subscription.entity';
import { BaseDao } from '@/common/dao/base.dao';

@Injectable()
export class WechatSubscriptionDao extends BaseDao<WechatSubscription> {
  constructor(
    @InjectRepository(WechatSubscription)
    repository: Repository<WechatSubscription>,
  ) {
    super(repository);
  }

  async findByMemberId(memberId: string): Promise<WechatSubscription[]> {
    return this.repository.find({
      where: { memberId },
    });
  }
}
