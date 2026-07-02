import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';
import { FamilyGroupDao } from '../dao/family-group.dao';
import { FamilyMemberDao } from '../dao/family-member.dao';
import { CreateFamilyDto } from '../dto/create-family.dto';
import { UpdateFamilyDto } from '../dto/update-family.dto';
import { FamilyGroupDto, FamilyMemberDto } from '../dto/family-group.dto';
import { FamilyGroup } from '../entities/family-group.entity';
import { FamilyMember } from '../entities/family-member.entity';

@Injectable()
export class FamilyService {
  constructor(
    private readonly familyGroupDao: FamilyGroupDao,
    private readonly familyMemberDao: FamilyMemberDao,
  ) {}

  // FamilyGroup CRUD
  async createGroup(dto: CreateFamilyDto): Promise<FamilyGroupDto> {
    const entity = await this.familyGroupDao.create(dto);
    return this.toGroupDto(entity as FamilyGroup);
  }

  async findAllGroups(query: PaginateQuery): Promise<Paginated<FamilyGroupDto>> {
    const result = await this.familyGroupDao.paginate(query);
    return {
      ...result,
      data: result.data.map((entity) => this.toGroupDto(entity as FamilyGroup)),
    } as Paginated<FamilyGroupDto>;
  }

  async findGroupById(id: string): Promise<FamilyGroupDto> {
    const entity = await this.familyGroupDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`FamilyGroup ${id} not found`);
    }
    return this.toGroupDto(entity as FamilyGroup);
  }

  async updateGroup(id: string, dto: UpdateFamilyDto): Promise<FamilyGroupDto> {
    const entity = await this.familyGroupDao.update(id, dto);
    if (!entity) {
      throw new NotFoundException(`FamilyGroup ${id} not found`);
    }
    return this.toGroupDto(entity as FamilyGroup);
  }

  async removeGroup(id: string): Promise<void> {
    const entity = await this.familyGroupDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`FamilyGroup ${id} not found`);
    }
    await this.familyGroupDao.delete(id);
  }

  // FamilyMember CRUD
  async createMember(dto: CreateFamilyDto): Promise<FamilyMemberDto> {
    const entity = await this.familyMemberDao.create(dto);
    return this.toMemberDto(entity as FamilyMember);
  }

  async findAllMembers(groupId?: string): Promise<FamilyMemberDto[]> {
    const entities = groupId
      ? await this.familyMemberDao.findByGroupId(groupId)
      : await this.familyMemberDao.findMany();
    return entities.map((e) => this.toMemberDto(e as FamilyMember));
  }

  async findMemberById(id: string): Promise<FamilyMemberDto> {
    const entity = await this.familyMemberDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`FamilyMember ${id} not found`);
    }
    return this.toMemberDto(entity as FamilyMember);
  }

  async findMemberByOpenId(openId: string): Promise<FamilyMemberDto | null> {
    const entity = await this.familyMemberDao.findByOpenId(openId);
    return entity ? this.toMemberDto(entity) : null;
  }

  async updateMember(id: string, dto: UpdateFamilyDto): Promise<FamilyMemberDto> {
    const entity = await this.familyMemberDao.update(id, dto);
    if (!entity) {
      throw new NotFoundException(`FamilyMember ${id} not found`);
    }
    return this.toMemberDto(entity as FamilyMember);
  }

  async removeMember(id: string): Promise<void> {
    const entity = await this.familyMemberDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`FamilyMember ${id} not found`);
    }
    await this.familyMemberDao.delete(id);
  }

  // Token 相关操作
  async updateMemberToken(
    id: string,
    refreshToken: string,
    tokenExpiresAt: Date,
  ): Promise<void> {
    await this.familyMemberDao.update(id, { refreshToken, tokenExpiresAt });
  }

  async clearMemberToken(id: string): Promise<void> {
    await this.familyMemberDao.update(id, {
      refreshToken: null,
      tokenExpiresAt: null,
    });
  }

  // 通过 openId 创建 member（仅 openId）
  async createMemberByOpenId(openId: string): Promise<FamilyMemberDto> {
    const entity = await this.familyMemberDao.create({ openId });
    return this.toMemberDto(entity as FamilyMember);
  }

  private toGroupDto(entity: FamilyGroup): FamilyGroupDto {
    return {
      id: entity.id,
      groupCode: entity.groupCode,
      memberLevel: entity.memberLevel,
      vipExpireTime: entity.vipExpireTime,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toMemberDto(entity: FamilyMember): FamilyMemberDto {
    return {
      id: entity.id,
      groupId: entity.groupId,
      openId: entity.openId,
      nickname: entity.nickname,
      avatarUrl: entity.avatarUrl,
      role: entity.role,
      joinTime: entity.joinTime,
      refreshToken: entity.refreshToken,
      tokenExpiresAt: entity.tokenExpiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
