import { PartialType } from '@nestjs/mapped-types';
import { CreateParrishDto } from './create-parrish.dto';

export class UpdateParrishDto extends PartialType(CreateParrishDto) {}
