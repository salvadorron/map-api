import { Module } from '@nestjs/common';
import { FilledFormService } from './filled_form.service';
import { FilledFormController } from './filled_form.controller';

@Module({
  controllers: [FilledFormController],
  providers: [FilledFormService],
})
export class FilledFormModule {}
