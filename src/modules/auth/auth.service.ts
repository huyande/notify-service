import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FamilyMember } from '../family/entities/family-member.entity';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(FamilyMember)
    private memberRepository: Repository<FamilyMember>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(openId: string): Promise<LoginResponseDto> {
    // TODO: 实现登录逻辑
    throw new Error('Not implemented');
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    // TODO: 实现刷新逻辑
    throw new Error('Not implemented');
  }

  async logout(memberId: string): Promise<void> {
    // TODO: 实现登出逻辑
  }
}
