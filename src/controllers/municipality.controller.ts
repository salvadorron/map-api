import { Controller, Get, Param } from '@nestjs/common';
import { MunicipalityService } from 'src/services/municipality.service';

@Controller('municipalities')
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
