import { Module } from '@nestjs/common';
import { MunicipalityController } from 'src/controllers/municipality.controller';
import { MunicipalityService } from 'src/services/municipality.service';

@Module({
  controllers: [MunicipalityController],
  providers: [MunicipalityService],
})
export class MunicipalityModule {}
