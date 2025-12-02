import { Module } from '@nestjs/common';
import { FilledFormController } from 'src/controllers/filled_form.controller';
import { FilledFormService } from 'src/services/filled_form.service';

@Module({
  controllers: [FilledFormController],
  providers: [FilledFormService],
})
export class FilledFormModule {}
