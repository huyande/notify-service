import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';
import { WechatSubscriptionDao } from '../dao/wechat-subscription.dao';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { WechatSubscriptionDto } from '../dto/wechat-subscription.dto';
import { WechatSubscription } from '../entities/wechat-subscription.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly wechatSubscriptionDao: WechatSubscriptionDao) {}

  async create(dto: CreateNotificationDto): Promise<WechatSubscriptionDto> {
    const entity = await this.wechatSubscriptionDao.create(dto);
    return this.toDto(entity as WechatSubscription);
  }

  async findAll(
    query: PaginateQuery,
  ): Promise<Paginated<WechatSubscriptionDto>> {
    const result = await this.wechatSubscriptionDao.paginate(query);
    return {
      ...result,
      data: result.data.map((entity) =>
        this.toDto(entity as WechatSubscription),
      ),
    } as Paginated<WechatSubscriptionDto>;
  }

  async findOne(id: string): Promise<WechatSubscriptionDto> {
    const entity = await this.wechatSubscriptionDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`WechatSubscription ${id} not found`);
    }
    return this.toDto(entity as WechatSubscription);
  }

  async update(
    id: string,
    dto: UpdateNotificationDto,
  ): Promise<WechatSubscriptionDto> {
    const entity = await this.wechatSubscriptionDao.update(id, dto);
    if (!entity) {
      throw new NotFoundException(`WechatSubscription ${id} not found`);
    }
    return this.toDto(entity as WechatSubscription);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.wechatSubscriptionDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`WechatSubscription ${id} not found`);
    }
    await this.wechatSubscriptionDao.delete(id);
  }

  private toDto(entity: WechatSubscription): WechatSubscriptionDto {
    return {
      id: entity.id,
      memberId: entity.memberId,
      templateId: entity.templateId,
      remainingCount: entity.remainingCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
