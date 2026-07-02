import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { MemberLevel } from '../enums/member-level.enum';
import { MemberRole } from '../enums/member-role.enum';

export class FamilyGroupDto {
  @ApiProperty({ description: '家庭组ID' })
  id: string;

  @ApiProperty({ description: '家庭组邀请码（6位）' })
  groupCode: string;

  @ApiProperty({ description: '会员等级', type: Number })
  memberLevel: MemberLevel;

  @ApiProperty({ description: 'VIP过期时间', nullable: true })
  vipExpireTime: Date | null;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class FamilyMemberDto {
  @ApiProperty({ description: '成员ID' })
  id: string;

  @ApiProperty({ description: '家庭组ID', nullable: true })
  groupId: string | null;

  @ApiProperty({ description: '微信OpenID' })
  openId: string;

  @ApiProperty({ description: '昵称' })
  nickname: string;

  @ApiProperty({ description: '头像URL' })
  avatarUrl: string;

  @ApiProperty({ description: '角色（1=创建者, 2=被邀请者）', type: Number })
  role: MemberRole;

  @ApiProperty({ description: '加入时间' })
  joinTime: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  // 内部使用字段，对外响应时通过 @Exclude() 自动排除（供 auth 模块读取）
  @Exclude()
  refreshToken: string | null;

  @Exclude()
  tokenExpiresAt: Date | null;
}
