import { Module } from '@nestjs/common';
import { FormController } from 'src/controllers/form.controller';
import { FormService } from 'src/services/form.service';

@Module({
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
