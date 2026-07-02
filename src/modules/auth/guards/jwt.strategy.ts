import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { FamilyService } from '@/modules/family/services/family.service';
import { LoginMemberDto } from '../dto/login-response.dto';

interface JwtPayload {
  member: LoginMemberDto;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly familyService: FamilyService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // 验证用户是否仍然存在
    const member = await this.familyService.findMemberById(payload.member.id);

    if (!member) {
      throw new UnauthorizedException('用户不存在');
    }

    return member;
  }
}
