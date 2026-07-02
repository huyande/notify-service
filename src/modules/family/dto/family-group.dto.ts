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
  groupId: string;
  openId: string;
  nickname: string;
  avatarUrl: string;
  role: number;
  joinTime: Date;
  createdAt: Date;
  updatedAt: Date;
}
