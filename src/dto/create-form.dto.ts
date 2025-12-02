import { IsArray, IsString, IsNotEmpty, ArrayNotEmpty, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { InputDto } from "./input.dto";
import { Type } from "class-transformer";

export class CreateFormDto {
    
    @IsArray({ message: 'inputs must be an array.' })
    @ArrayNotEmpty({ message: 'inputs must not be empty.' })
    @Type(() => InputDto)
    @ValidateNested({ each: true })
    inputs: InputDto[];

    @IsString({ message: 'title must be a string.' })
    @IsNotEmpty({ message: 'title is required.' })
    title: string;

    @IsString({ message: 'category_id must be a string.' })
    @IsUUID('4', { message: 'category_id must be a valid UUID.' })
    @IsNotEmpty({ message: 'category_id is required.' })
    category_id: string;
    
    @IsString({ message: 'tag must be a string.' })
    @IsOptional()
    tag?: string;
}