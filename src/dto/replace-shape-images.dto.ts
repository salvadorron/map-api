import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ShapeImageDto {
  @IsString({ message: 'url must be a string.' })
  @IsNotEmpty({ message: 'url is required.' })
  url: string;

  @IsOptional()
  @IsString({ message: 'name must be a string.' })
  name?: string;

  @IsOptional()
  @IsInt({ message: 'size must be an integer.' })
  @Min(0, { message: 'size must be a non-negative integer.' })
  size?: number;
}

export class ReplaceShapeImagesDto {
  @IsArray({ message: 'images must be an array.' })
  @ValidateNested({ each: true })
  @Type(() => ShapeImageDto)
  images: ShapeImageDto[];
}
