import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class PushSubscribeDto {
  @ApiProperty({ description: '幂等键，全链路唯一', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @ApiProperty({
    description: '目标小程序 appId',
    example: 'wx1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @ApiProperty({ description: '订阅消息模板 ID', example: 'tpl_demo' })
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @ApiProperty({ description: '接收者 openid', example: 'oXXXX' })
  @IsString()
  @IsNotEmpty()
  openid!: string;

  @ApiProperty({ description: '业务数据，由策略组装为微信模板字段' })
  @IsObject()
  data!: Record<string, unknown>;

  @ApiPropertyOptional({ description: '点击跳转页' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: '小程序版本环境',
    enum: ['developer', 'trial', 'formal'],
  })
  @IsOptional()
  @IsIn(['developer', 'trial', 'formal'])
  miniprogramState?: string;

  @ApiPropertyOptional({ description: '语言', example: 'zh_CN' })
  @IsOptional()
  @IsString()
  lang?: string;

  @ApiPropertyOptional({ description: '覆盖账户配置的回调地址' })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}
