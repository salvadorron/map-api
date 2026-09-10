import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ReplaceShapeImagesDto } from 'src/dto/replace-shape-images.dto';
import { ShapeImageService } from 'src/services/shape-image.service';

@Controller('shapes/:id/images')
export class ShapeImageController {
  constructor(private readonly shapeImageService: ShapeImageService) {}

  @Get()
  getByShape(@Param('id') id: string) {
    return this.shapeImageService.getByShape(id);
  }

  @Put()
  replace(
    @Param('id') id: string,
    @Body() replaceShapeImagesDto: ReplaceShapeImagesDto,
  ) {
    return this.shapeImageService.replace(id, replaceShapeImagesDto.images);
  }
}
