import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParrishService } from './parrish.service';
import { CreateParrishDto } from './dto/create-parrish.dto';
import { UpdateParrishDto } from './dto/update-parrish.dto';

@Controller('parrish')
export class ParrishController {
  constructor(private readonly parrishService: ParrishService) {}

  @Post()
  create(@Body() createParrishDto: CreateParrishDto) {
    return this.parrishService.create(createParrishDto);
  }

  @Get()
  findAll() {
    return this.parrishService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parrishService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParrishDto: UpdateParrishDto) {
    return this.parrishService.update(+id, updateParrishDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parrishService.remove(+id);
  }
}
