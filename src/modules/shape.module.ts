import { Module } from '@nestjs/common';
import { ShapeController } from 'src/controllers/shape.controller';
import { ShapeService } from 'src/services/shape.service';

@Module({
  controllers: [ShapeController],
  providers: [ShapeService],
})
export class ShapeModule {}
