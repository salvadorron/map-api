import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class InputDto {
    @IsString({ message: 'inputType must be a string.' })
    @IsIn(['textarea', 'date', 'text', 'number'], { message: 'inputType must be one of the following: textarea, date, text, number.' })
    inputType: string;
    
    @IsString({ message: 'label must be a string.' })
    @IsNotEmpty({ message: 'label is required.' })
    label: string;
    
    @IsString({ message: 'placeholder must be a string.' })
    @IsOptional()
    placeholder?: string;
    
    @IsBoolean()
    required: boolean = false;
}