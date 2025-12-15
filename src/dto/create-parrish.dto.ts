import { IsString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateParrishDto {
    @IsString({ message: 'name must be a string.' })
    @IsNotEmpty({ message: 'name is required.' })
    name: string;

    @IsString({ message: 'code must be a string.' })
    @IsNotEmpty({ message: 'code is required.' })
    code: string;

    @IsUUID('4', { message: 'municipality_id must be a valid UUID.' })
    @IsNotEmpty({ message: 'municipality_id is required.' })
    municipality_id: string;
}
