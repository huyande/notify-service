import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FamilyMember } from '../family/entities/family-member.entity';
import { FamilyGroup } from '../family/entities/family-group.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { MemberRole } from '../family/enums/member-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(FamilyMember)
    private memberRepository: Repository<FamilyMember>,
    @InjectRepository(FamilyGroup)
    private groupRepository: Repository<FamilyGroup>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(openId: string): Promise<LoginResponseDto> {
    if (!openId) {
      throw new UnauthorizedException('缺少 openId');
    }

    // 1. 查询用户
    let member = await this.memberRepository.findOne({
      where: { openId },
    });

    const now = new Date();

    // 2. 不存在则自动注册
    if (!member) {
      // 查找或创建默认家庭组
      let group = await this.groupRepository.findOne({
        where: { groupCode: 'DEFAULT' },
      });

      if (!group) {
        group = this.groupRepository.create({
          groupCode: 'DEFAULT',
          memberLevel: 1,
        });
        group = await this.groupRepository.save(group);
      }

      member = this.memberRepository.create({
        openId,
        nickname: `用户${openId.slice(-4)}`,
        avatarUrl: '',
        role: MemberRole.Creator,
        groupId: group.id,
        joinTime: now,
        isRemindEnabled: 1,
      });
      member = await this.memberRepository.save(member);
    }

    // 3. 检查现有 refreshToken 是否有效（多设备共存）
    const tokenExpiresAt = member.tokenExpiresAt ? new Date(member.tokenExpiresAt) : null;

    if (member.refreshToken && tokenExpiresAt && tokenExpiresAt > now) {
      // 有效：直接返回现有 Token
      const accessToken = await this.generateAccessToken(member);
      return {
        accessToken,
        refreshToken: member.refreshToken,
      };
    }

    // 4. 无效/不存在：颁发新 Token
    const accessToken = await this.generateAccessToken(member);
    const refreshToken = await this.generateRefreshToken(member);

    const refreshExpirationDays = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    );
    const newTokenExpiresAt = new Date(
      now.getTime() + refreshExpirationDays * 24 * 60 * 60 * 1000,
    );

    member.refreshToken = refreshToken;
    member.tokenExpiresAt = newTokenExpiresAt;
    await this.memberRepository.save(member);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(member: FamilyMember): Promise<string> {
    const payload = { sub: member.id, openId: member.openId };
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION');
    return this.jwtService.sign(payload, { expiresIn });
  }

  private async generateRefreshToken(member: FamilyMember): Promise<string> {
    const payload = { sub: member.id, openId: member.openId, type: 'refresh' };
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION');
    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    // TODO: 实现刷新逻辑
    throw new Error('Not implemented');
  }

  async logout(memberId: string): Promise<void> {
    // TODO: 实现登出逻辑
  }
}
