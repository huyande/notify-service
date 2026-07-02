import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePackage } from './entities/course-package.entity';
import { CourseTimeRule } from './entities/course-time-rule.entity';
import { CoursePackageDao } from './dao/course-package.dao';
import { CourseTimeRuleDao } from './dao/course-time-rule.dao';
import { CourseService } from './services/course.service';
import { CourseController } from './course.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CoursePackage, CourseTimeRule])],
  providers: [CoursePackageDao, CourseTimeRuleDao, CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
