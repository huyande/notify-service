import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMyProfileDto {
  @ApiProperty({
    description: '昵称',
    example: '小明妈妈',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

  @ApiProperty({
    description: '头像 URL',
    example: 'https://thirdwx.qlogo.cn/mmopen/xxx/132',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatarUrl?: string;
}
