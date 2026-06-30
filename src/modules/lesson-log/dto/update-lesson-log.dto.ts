import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonLogDto } from './create-lesson-log.dto';

export class UpdateLessonLogDto extends PartialType(CreateLessonLogDto) {}
