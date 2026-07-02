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
import { ChildService } from './services/child.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildDto } from './dto/child.dto';

@Controller('child')
export class ChildController {
  constructor(private readonly childService: ChildService) {}

  @Post()
  create(@Body() createChildDto: CreateChildDto) {
    return this.childService.create(createChildDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.childService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.childService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChildDto: UpdateChildDto) {
    return this.childService.update(id, updateChildDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.childService.remove(id);
  }
}
