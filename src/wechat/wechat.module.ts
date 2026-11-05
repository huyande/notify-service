import { Module } from '@nestjs/common';
import { AppsModule } from '../app/apps.module';
import { TokenCache } from './token.cache';
import { WechatClient } from './wechat.client';
import { WechatService } from './wechat.service';

@Module({
  imports: [AppsModule],
  providers: [TokenCache, WechatClient, WechatService],
  exports: [WechatService],
})
export class WechatModule {}
