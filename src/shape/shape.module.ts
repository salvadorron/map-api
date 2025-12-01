import { Module } from '@nestjs/common';
import { ShapeService } from './shape.service';
import { ShapeController } from './shape.controller';
import { PgService } from 'src/database/pg-config.service';

@Module({
  controllers: [ShapeController],
  providers: [PgService, ShapeService],
})
export class ShapeModule {}
