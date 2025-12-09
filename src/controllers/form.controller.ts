import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateFormDto } from 'src/dto/create-form.dto';
import { FormFilters } from 'src/dto/filters.dto';
import { UpdateFormDto } from 'src/dto/update-form.dto';
import { FormService } from 'src/services/form.service';

@Controller('forms')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto) {
    return this.formService.create(createFormDto);
  }

  @Get()
  findAll(@Query() filters: FormFilters) {
    return this.formService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formService.update(id, updateFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formService.remove(id);
  }
}
