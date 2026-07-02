import { MemberLevel } from '../enums/member-level.enum';

export class FamilyGroupDto {
  id: string;
  groupCode: string;
  memberLevel: MemberLevel;
  vipExpireTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FamilyMemberDto {
  id: string;
  groupId: string | null;
  openId: string;
  nickname: string;
  avatarUrl: string;
  role: number;
  joinTime: Date;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
