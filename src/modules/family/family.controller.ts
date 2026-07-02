import { Controller, Get, Patch, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './services/family.service';
import { UpdateMyProfileDto } from './dto/update-profile.dto';
import { FamilyMemberDto } from './dto/family-group.dto';

@ApiTags('家庭')
@ApiBearerAuth()
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Patch('me/profile')
  @ApiOperation({ summary: '更新当前用户的昵称和头像' })
  updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateMyProfileDto,
  ): Promise<FamilyMemberDto> {
    return this.familyService.updateMyProfile(req.user.id, dto);
  }

  @Get('groups/:groupId/members')
  @ApiOperation({ summary: '获取家庭成员列表（仅本组成员可查）' })
  getGroupMembers(
    @Param('groupId') groupId: string,
    @Req() req: any,
  ): Promise<FamilyMemberDto[]> {
    return this.familyService.getGroupMembers(groupId, req.user.id);
  }
}
