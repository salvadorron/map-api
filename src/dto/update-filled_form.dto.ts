import { PartialType } from '@nestjs/mapped-types';
import { CreateFilledFormDto } from './create-filled_form.dto';

export class UpdateFilledFormDto extends PartialType(CreateFilledFormDto) {}
