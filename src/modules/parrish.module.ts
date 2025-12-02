import { Module } from '@nestjs/common';
import { ParrishController } from 'src/controllers/parrish.controller';
import { ParrishService } from 'src/services/parrish.service';

@Module({
  controllers: [ParrishController],
  providers: [ParrishService],
})
export class ParrishModule {}
