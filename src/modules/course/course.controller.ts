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
import { CourseService } from './services/course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.createPackage(createCourseDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.courseService.findAllPackages(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findPackageById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.updatePackage(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.removePackage(id);
  }
}
