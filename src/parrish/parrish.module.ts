import { Module } from '@nestjs/common';
import { ParrishService } from './parrish.service';
import { ParrishController } from './parrish.controller';

@Module({
  controllers: [ParrishController],
  providers: [ParrishService],
})
export class ParrishModule {}
