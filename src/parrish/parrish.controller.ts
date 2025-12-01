import { Controller, Get, Param } from '@nestjs/common';
import { ParrishService } from './parrish.service';

@Controller('parrish')
export class ParrishController {
  constructor(private readonly parrishService: ParrishService) {}

  @Get()
  findAll() {
    return this.parrishService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parrishService.findOne(id);
  }

}
