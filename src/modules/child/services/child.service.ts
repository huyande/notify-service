import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';
import { ChildAccountDao } from '../dao/child-account.dao';
import { CreateChildDto } from '../dto/create-child.dto';
import { UpdateChildDto } from '../dto/update-child.dto';
import { ChildDto } from '../dto/child.dto';
import { ChildAccount } from '../entities/child-account.entity';

@Injectable()
export class ChildService {
  constructor(private readonly childDao: ChildAccountDao) {}

  async create(dto: CreateChildDto): Promise<ChildDto> {
    const entity = await this.childDao.create(dto);
    return this.toDto(entity);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<ChildDto>> {
    const result = await this.childDao.paginate(query);
    return {
      ...result,
      data: result.data.map((entity) => this.toDto(entity as ChildAccount)),
    } as Paginated<ChildDto>;
  }

  async findOne(id: string): Promise<ChildDto> {
    const entity = await this.childDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Child ${id} not found`);
    }
    return this.toDto(entity);
  }

  async update(id: string, dto: UpdateChildDto): Promise<ChildDto> {
    const entity = await this.childDao.update(id, dto);
    if (!entity) {
      throw new NotFoundException(`Child ${id} not found`);
    }
    return this.toDto(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.childDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`Child ${id} not found`);
    }
    await this.childDao.delete(id);
  }

  private toDto(entity: ChildAccount): ChildDto {
    return {
      id: entity.id,
      groupId: entity.groupId,
      childName: entity.childName,
      themeColor: entity.themeColor,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
