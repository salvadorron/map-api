import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateFilledFormDto } from './create-filled_form.dto';

export class UpdateFilledFormDto extends PartialType(CreateFilledFormDto) {
  @IsOptional()
  @IsString({ message: 'form_version_id must be a string.' })
  @IsUUID('4', { message: 'form_version_id must be a valid UUID.' })
  form_version_id?: string;
}
