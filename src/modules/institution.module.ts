import { Module } from '@nestjs/common';
import { InstitutionService } from '../services/institution.service';
import { InstitutionController } from '../controllers/institution.controller';

@Module({
  controllers: [InstitutionController],
  providers: [InstitutionService],
  exports: [InstitutionService],
})
export class InstitutionModule {}
