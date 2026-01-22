import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, ValidateNested, IsString } from "class-validator";

class Option {
    @IsString({ message: 'value must be a string.' })
    @IsNotEmpty({ message: 'value is required.' })
    value: string;

    @IsString({ message: 'label must be a string.' })
    @IsNotEmpty({ message: 'label is required.' })
    label: string;
}
export class InputDto {
    @IsString({ message: 'inputType must be a string.' })
    @IsIn(['textarea', 'date', 'text', 'number', 'select', 'checkbox'], { message: 'inputType must be one of the following: textarea, date, text, number, select, checkbox.' })
    inputType: string;

    @IsString({ message: 'label must be a string.' })
    @IsNotEmpty({ message: 'label is required.' })
    label: string;

    @IsString({ message: 'placeholder must be a string.' })
    @IsOptional()
    placeholder?: string;

    @IsOptional()
    @IsArray({ message: 'options must be an array.' })
    @ValidateNested({ each: true })
    @Type(() => Option)
    options?: Option[]

    @IsBoolean()
    required: boolean = false;
}