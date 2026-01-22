import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateShapeDto } from 'src/dto/create-shape.dto';
import { ShapeFilters } from 'src/dto/filters.dto';
import { UpdateShapeDto } from 'src/dto/update-shape.dto';
import { ShapeService } from 'src/services/shape.service';

@Controller('shapes')
export class ShapeController {
  constructor(private readonly shapeService: ShapeService) {}

  @Post()
  create(@Body() createShapeDto: CreateShapeDto) {
    return this.shapeService.create(createShapeDto);
  }

  @Get()
  findAll(@Query() filters: ShapeFilters) {
    return this.shapeService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shapeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShapeDto: UpdateShapeDto) {
    return this.shapeService.update(id, updateShapeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shapeService.remove(id);
  }
}
