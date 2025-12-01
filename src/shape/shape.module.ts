import { Module } from '@nestjs/common';
import { ShapeService } from './shape.service';
import { ShapeController } from './shape.controller';

@Module({
  controllers: [ShapeController],
  providers: [ShapeService],
})
export class ShapeModule {}
