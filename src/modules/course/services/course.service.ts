import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated, PaginateQuery } from 'nestjs-paginate';
import { CoursePackageDao } from '../dao/course-package.dao';
import { CourseTimeRuleDao } from '../dao/course-time-rule.dao';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CoursePackageDto, CourseTimeRuleDto } from '../dto/course.dto';
import { CoursePackage } from '../entities/course-package.entity';
import { CourseTimeRule } from '../entities/course-time-rule.entity';

@Injectable()
export class CourseService {
  constructor(
    private readonly coursePackageDao: CoursePackageDao,
    private readonly courseTimeRuleDao: CourseTimeRuleDao,
  ) {}

  // CoursePackage CRUD
  async createPackage(dto: CreateCourseDto): Promise<CoursePackageDto> {
    const entity = await this.coursePackageDao.create(dto);
    return this.toPackageDto(entity as CoursePackage);
  }

  async findAllPackages(
    query: PaginateQuery,
  ): Promise<Paginated<CoursePackageDto>> {
    const result = await this.coursePackageDao.paginate(query);
    return {
      ...result,
      data: result.data.map((entity) =>
        this.toPackageDto(entity as CoursePackage),
      ),
    } as Paginated<CoursePackageDto>;
  }

  async findPackageById(id: string): Promise<CoursePackageDto> {
    const entity = await this.coursePackageDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`CoursePackage ${id} not found`);
    }
    return this.toPackageDto(entity as CoursePackage);
  }

  async updatePackage(
    id: string,
    dto: UpdateCourseDto,
  ): Promise<CoursePackageDto> {
    const entity = await this.coursePackageDao.update(id, dto);
    if (!entity) {
      throw new NotFoundException(`CoursePackage ${id} not found`);
    }
    return this.toPackageDto(entity as CoursePackage);
  }

  async removePackage(id: string): Promise<void> {
    const entity = await this.coursePackageDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`CoursePackage ${id} not found`);
    }
    await this.coursePackageDao.delete(id);
  }

  // CourseTimeRule CRUD
  async createTimeRule(dto: CreateCourseDto): Promise<CourseTimeRuleDto> {
    const entity = await this.courseTimeRuleDao.create(dto);
    return this.toTimeRuleDto(entity as CourseTimeRule);
  }

  async findAllTimeRules(packageId?: string): Promise<CourseTimeRuleDto[]> {
    const entities = packageId
      ? await this.courseTimeRuleDao.findByPackageId(packageId)
      : await this.courseTimeRuleDao.findMany();
    return entities.map((e) => this.toTimeRuleDto(e as CourseTimeRule));
  }

  async findTimeRuleById(id: string): Promise<CourseTimeRuleDto> {
    const entity = await this.courseTimeRuleDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`CourseTimeRule ${id} not found`);
    }
    return this.toTimeRuleDto(entity as CourseTimeRule);
  }

  async updateTimeRule(
    id: string,
    dto: UpdateCourseDto,
  ): Promise<CourseTimeRuleDto> {
    const entity = await this.courseTimeRuleDao.update(id, dto);
    if (!entity) {
      throw new NotFoundException(`CourseTimeRule ${id} not found`);
    }
    return this.toTimeRuleDto(entity as CourseTimeRule);
  }

  async removeTimeRule(id: string): Promise<void> {
    const entity = await this.courseTimeRuleDao.findOne(id);
    if (!entity) {
      throw new NotFoundException(`CourseTimeRule ${id} not found`);
    }
    await this.courseTimeRuleDao.delete(id);
  }

  private toPackageDto(entity: CoursePackage): CoursePackageDto {
    return {
      id: entity.id,
      childId: entity.childId,
      courseName: entity.courseName,
      totalPrice: entity.totalPrice,
      totalLessons: entity.totalLessons,
      remainLessons: entity.remainLessons,
      isAutoDeduct: entity.isAutoDeduct,
      deductAmount: entity.deductAmount,
      cardColor: entity.cardColor,
      remindRule: entity.remindRule,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toTimeRuleDto(entity: CourseTimeRule): CourseTimeRuleDto {
    return {
      id: entity.id,
      packageId: entity.packageId,
      weekDay: entity.weekDay,
      startTime: entity.startTime,
      endTime: entity.endTime,
      timeBranch: entity.timeBranch,
      isFinished: entity.isFinished,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
