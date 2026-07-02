import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import type { PaginateQuery } from 'nestjs-paginate';
import { LessonLogService } from './services/lesson-log.service';
import { CreateLessonLogDto } from './dto/create-lesson-log.dto';
import { UpdateLessonLogDto } from './dto/update-lesson-log.dto';

@Controller('lesson-log')
export class LessonLogController {
  constructor(private readonly lessonLogService: LessonLogService) {}

  @Post()
  create(@Body() createLessonLogDto: CreateLessonLogDto) {
    return this.lessonLogService.create(createLessonLogDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.lessonLogService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonLogService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonLogDto: UpdateLessonLogDto,
  ) {
    return this.lessonLogService.update(id, updateLessonLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonLogService.remove(id);
  }
}
