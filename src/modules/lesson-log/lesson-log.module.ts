import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassChangeLog } from './entities/class-change-log.entity';
import { LessonLogController } from './lesson-log.controller';
import { LessonLogService } from './lesson-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClassChangeLog])],
  controllers: [LessonLogController],
  providers: [LessonLogService],
  exports: [TypeOrmModule],
})
export class LessonLogModule {}
