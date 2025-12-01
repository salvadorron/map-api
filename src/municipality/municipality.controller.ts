import { Controller, Get, Param } from '@nestjs/common';
import { MunicipalityService } from './municipality.service';

@Controller('municipality')
export class MunicipalityController {
  constructor(private readonly municipalityService: MunicipalityService) {}

  @Get()
  findAll() {
    return this.municipalityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.municipalityService.findOne(id);
  }
}
