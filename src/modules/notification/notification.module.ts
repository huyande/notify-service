import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WechatSubscription } from './entities/wechat-subscription.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([WechatSubscription])],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [TypeOrmModule],
})
export class NotificationModule {}
