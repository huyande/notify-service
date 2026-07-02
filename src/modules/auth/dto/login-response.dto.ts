import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@/modules/family/enums/member-role.enum';

export class LoginMemberDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '家庭组ID', nullable: true })
  groupId: string | null;

  @ApiProperty({ description: '微信OpenID' })
  openId: string;

  @ApiProperty({ description: '昵称' })
  nickname: string;

  @ApiProperty({ description: '头像URL' })
  avatarUrl: string;

  @ApiProperty({ description: '角色', type: Number })
  role: MemberRole;

  @ApiProperty({ description: '加入时间' })
  joinTime: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '访问令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: '用户信息',
    type: LoginMemberDto,
  })
  member: LoginMemberDto;
}
