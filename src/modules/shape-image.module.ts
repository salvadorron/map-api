import { Module } from '@nestjs/common';
import { ShapeImageController } from 'src/controllers/shape-image.controller';
import { ShapeImageService } from 'src/services/shape-image.service';

@Module({
  controllers: [ShapeImageController],
  providers: [ShapeImageService],
})
export class ShapeImageModule {}
