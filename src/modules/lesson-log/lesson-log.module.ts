import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassChangeLog } from './entities/class-change-log.entity';
import { ClassChangeLogDao } from './dao/class-change-log.dao';
import { LessonLogService } from './services/lesson-log.service';
import { LessonLogController } from './lesson-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClassChangeLog])],
  providers: [ClassChangeLogDao, LessonLogService],
  controllers: [LessonLogController],
  exports: [LessonLogService],
})
export class LessonLogModule {}
