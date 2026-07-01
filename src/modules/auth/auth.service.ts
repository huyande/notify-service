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
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    return this.jwtService.signAsync(payload, { expiresIn });
  }

  private async generateRefreshToken(member: FamilyMember): Promise<string> {
    const payload = { sub: member.id, openId: member.openId, type: 'refresh' as const };
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    return this.jwtService.signAsync(payload, { secret, expiresIn });
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
      const member = await this.memberRepository.findOne({
        where: { id: payload.sub },
      });

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
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      );
      const newTokenExpiresAt = new Date(
        Date.now() + refreshExpirationDays * 24 * 60 * 60 * 1000,
      );

      member.refreshToken = newRefreshToken;
      member.tokenExpiresAt = newTokenExpiresAt;
      await this.memberRepository.save(member);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('RefreshToken 验证失败');
    }
  }

  async logout(memberId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    if (member) {
      member.refreshToken = null;
      member.tokenExpiresAt = null;
      await this.memberRepository.save(member);
    }
  }
}
