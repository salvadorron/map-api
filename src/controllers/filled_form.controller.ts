import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateFilledFormDto } from 'src/dto/create-filled_form.dto';
import { UpdateFilledFormDto } from 'src/dto/update-filled_form.dto';
import { FilledFormService } from 'src/services/filled_form.service';

@Controller('filled-forms')
export class FilledFormController {
  constructor(private readonly filledFormService: FilledFormService) {}

  @Post()
  create(@Body() createFilledFormDto: CreateFilledFormDto) {
    return this.filledFormService.create(createFilledFormDto);
  }

  @Get()
  findAll() {
    return this.filledFormService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filledFormService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilledFormDto: UpdateFilledFormDto) {
    return this.filledFormService.update(id, updateFilledFormDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filledFormService.remove(id);
  }
}
