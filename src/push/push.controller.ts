import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PushSubscribeDto } from './dto/push-subscribe.dto';
import { EnqueueResult, PushService } from './push.service';

@ApiTags('push')
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: '提交订阅消息推送请求（幂等入队）' })
  send(@Body() dto: PushSubscribeDto): Promise<EnqueueResult> {
    return this.pushService.enqueue(dto);
  }
}
