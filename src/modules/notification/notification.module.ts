import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WechatSubscription } from './entities/wechat-subscription.entity';
import { WechatSubscriptionDao } from './dao/wechat-subscription.dao';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WechatSubscription])],
  providers: [WechatSubscriptionDao, NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
