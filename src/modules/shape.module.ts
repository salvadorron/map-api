import { Module } from '@nestjs/common';
import { ShapeController } from 'src/controllers/shape.controller';
import { ShapeService } from 'src/services/shape.service';
import { AlsModule } from './als.module';

@Module({
  imports: [AlsModule],
  controllers: [ShapeController],
  providers: [ShapeService],
})
export class ShapeModule {}
