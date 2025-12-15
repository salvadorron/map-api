import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateInstitutionDto } from 'src/dto/create-institution.dto';
import { UpdateInstitutionDto } from 'src/dto/update-institution.dto';
import { InstitutionService } from 'src/services/institution.service';

@Controller('institutions')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Post()
  create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionService.create(createInstitutionDto);
  }

  @Get()
  findAll() {
    return this.institutionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.institutionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstitutionDto: UpdateInstitutionDto) {
    return this.institutionService.update(id, updateInstitutionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.institutionService.remove(id);
  }
}
