import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParrishFilters } from 'src/dto/filters.dto';
import { ParrishService } from 'src/services/parrish.service';

@Controller('parrishes')
export class ParrishController {
  constructor(private readonly parrishService: ParrishService) {}

  @Get()
  findAll(@Query() filters: ParrishFilters) {
    return this.parrishService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parrishService.findOne(id);
  }

}
