import { Injectable } from '@nestjs/common';
import { CreateLessonLogDto } from './dto/create-lesson-log.dto';
import { UpdateLessonLogDto } from './dto/update-lesson-log.dto';

@Injectable()
export class LessonLogService {
  create(createLessonLogDto: CreateLessonLogDto) {
    return 'This action adds a new lessonLog';
  }

  findAll() {
    return `This action returns all lessonLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonLog`;
  }

  update(id: number, updateLessonLogDto: UpdateLessonLogDto) {
    return `This action updates a #${id} lessonLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonLog`;
  }
}
