import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LessonLogService } from './lesson-log.service';
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
  findAll() {
    return this.lessonLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonLogService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonLogDto: UpdateLessonLogDto,
  ) {
    return this.lessonLogService.update(+id, updateLessonLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonLogService.remove(+id);
  }
}
