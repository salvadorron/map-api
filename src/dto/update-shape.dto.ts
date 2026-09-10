import { PartialType } from '@nestjs/mapped-types';
import { CreateShapeDto } from './create-shape.dto';

export class UpdateShapeDto extends PartialType(CreateShapeDto) {}
