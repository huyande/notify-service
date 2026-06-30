import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursePackage } from './entities/course-package.entity';
import { CourseTimeRule } from './entities/course-time-rule.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoursePackage, CourseTimeRule])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [TypeOrmModule],
})
export class CourseModule {}
