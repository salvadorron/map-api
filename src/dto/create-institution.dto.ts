import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateInstitutionDto {
    @IsString({ message: 'code must be a string.' })
    @IsNotEmpty({ message: 'code is required.' })
    @MaxLength(255, { message: 'code must not exceed 255 characters.' })
    code: string;

    @IsString({ message: 'name must be a string.' })
    @IsNotEmpty({ message: 'name is required.' })
    @MaxLength(255, { message: 'name must not exceed 255 characters.' })
    name: string;
}
