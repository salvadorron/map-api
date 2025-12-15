import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateRoleDto {
    @IsString({ message: 'name must be a string.' })
    @IsNotEmpty({ message: 'name is required.' })
    @MaxLength(50, { message: 'name must not exceed 50 characters.' })
    name: string;
}
