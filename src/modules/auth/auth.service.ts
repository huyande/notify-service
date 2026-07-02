import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FamilyService } from '../family/services/family.service';
import { LoginResponseDto, LoginMemberDto } from './dto/login-response.dto';
import { FamilyMemberDto } from '../family/dto/family-group.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly familyService: FamilyService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(openId: string): Promise<LoginResponseDto> {
    if (!openId) {
      throw new UnauthorizedException('缺少 openId');
    }

    // 1. 查询用户
    let member = await this.familyService.findMemberByOpenId(openId);

    const now = new Date();

    // 2. 不存在则自动注册（仅保存 openId）
    if (!member) {
      member = await this.familyService.createMemberByOpenId(openId);
    }

    // 3. 检查现有 refreshToken 是否有效（多设备共存）
    const tokenExpiresAt = member.tokenExpiresAt
      ? new Date(member.tokenExpiresAt)
      : null;

    let refreshToken: string;
    let newTokenExpiresAt: Date;

    if (member.refreshToken && tokenExpiresAt && tokenExpiresAt > now) {
      // 有效：使用现有 Token
      refreshToken = member.refreshToken;
      newTokenExpiresAt = tokenExpiresAt;
    } else {
      // 无效/不存在：颁发新 Token
      const refreshExpirationDays = parseInt(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7',
      );
      newTokenExpiresAt = new Date(
        now.getTime() + refreshExpirationDays * 24 * 60 * 60 * 1000,
      );

      refreshToken = await this.generateRefreshToken(member);
      await this.familyService.updateMemberToken(
        member.id,
        refreshToken,
        newTokenExpiresAt,
      );
    }

    const accessToken = await this.generateAccessToken(member);

    return { accessToken, refreshToken, member: this.toLoginMember(member) };
  }

  private async generateAccessToken(member: FamilyMemberDto): Promise<string> {
    const loginMember = this.toLoginMember(member);
    const payload = { member: loginMember };
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    return this.jwtService.signAsync(payload, { expiresIn } as any);
  }

  private async generateRefreshToken(member: FamilyMemberDto): Promise<string> {
    const payload = { sub: member.id, openId: member.openId, type: 'refresh' as const };
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    return this.jwtService.signAsync(payload, { secret, expiresIn } as any);
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('缺少 refreshToken');
    }

    try {
      // 验证 refreshToken
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
      const payload = this.jwtService.verify(refreshToken, { secret });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token 类型无效');
      }

      // 查询用户
      const member = await this.familyService.findMemberById(payload.sub);
      if (!member) {
        throw new UnauthorizedException('用户不存在');
      }

      // 验证数据库中的 refreshToken 是否匹配
      if (member.refreshToken !== refreshToken) {
        throw new UnauthorizedException('RefreshToken 无效');
      }

      // 生成新的 Token 对
      const accessToken = await this.generateAccessToken(member);
      const newRefreshToken = await this.generateRefreshToken(member);

      const refreshExpirationDays = parseInt(
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7',
      );
      const newTokenExpiresAt = new Date(
        Date.now() + refreshExpirationDays * 24 * 60 * 60 * 1000,
      );

      await this.familyService.updateMemberToken(
        member.id,
        newRefreshToken,
        newTokenExpiresAt,
      );

      return { accessToken, refreshToken: newRefreshToken, member: this.toLoginMember(member) };
    } catch (error) {
      throw new UnauthorizedException('RefreshToken 验证失败');
    }
  }

  async logout(memberId: string): Promise<void> {
    await this.familyService.clearMemberToken(memberId);
  }

  private toLoginMember(member: FamilyMemberDto): LoginMemberDto {
    return {
      id: member.id,
      groupId: member.groupId,
      openId: member.openId,
      nickname: member.nickname,
      avatarUrl: member.avatarUrl,
      role: member.role,
      joinTime: member.joinTime,
    };
  }
}
