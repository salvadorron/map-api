import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateMunicipalityDto {
    @IsString({ message: 'name must be a string.' })
    @IsNotEmpty({ message: 'name is required.' })
    name: string;

    @IsOptional()
    @IsString({ message: 'short_name must be a string.' })
    short_name?: string | null;
}
