import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';
import { ClassChangeLogDao } from '../dao/class-change-log.dao';
import { CreateLessonLogDto } from '../dto/create-lesson-log.dto';
import { UpdateLessonLogDto } from '../dto/update-lesson-log.dto';
import { ClassChangeLogDto } from '../dto/class-change-log.dto';
import { ClassChangeLog } from '../entities/class-change-log.entity';

@Injectable()
export class LessonLogService {
  constructor(private readonly classChangeLogDao: ClassChangeLogDao) {}

  async create(dto: CreateLessonLogDto): Promise<ClassChangeLogDto> {
    const entity = await this.classChangeLogDao.create(dto);
    return this.toDto(entity as ClassChangeLog);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<ClassChangeLogDto>> {
    const result = await this.classChangeLogDao.paginate(query);
    return {
      ...result,
      data: result.data.map((entity) => this.toDto(entity as ClassChangeLog)),
    } as Paginated<ClassChangeLogDto>;
  }

  async findOne(id: string): Promise<ClassChangeLogDto> {
    const entity = await this.classChangeLogDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`ClassChangeLog ${id} not found`);
    }
    return this.toDto(entity as ClassChangeLog);
  }

  async update(id: string, dto: UpdateLessonLogDto): Promise<ClassChangeLogDto> {
    const entity = await this.classChangeLogDao.update(id, dto);
    if (!entity) {
      throw new NotFoundException(`ClassChangeLog ${id} not found`);
    }
    return this.toDto(entity as ClassChangeLog);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.classChangeLogDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`ClassChangeLog ${id} not found`);
    }
    await this.classChangeLogDao.delete(id);
  }

  private toDto(entity: ClassChangeLog): ClassChangeLogDto {
    return {
      id: entity.id,
      packageId: entity.packageId,
      operatorId: entity.operatorId,
      actionType: entity.actionType,
      lessonChange: entity.lessonChange,
      reason: entity.reason,
      occurTime: entity.occurTime,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
