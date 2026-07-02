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
import { FamilyService } from './services/family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familyService.createGroup(createFamilyDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.familyService.findAllGroups(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familyService.findGroupById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familyService.updateGroup(id, updateFamilyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familyService.removeGroup(id);
  }
}
