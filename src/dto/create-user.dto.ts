import { IsString, IsUUID, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsString()
    fullname: string

    @IsString()
    username: string

    @IsString()
    email: string

    @IsString()
    password: string

    @IsUUID()
    role_id: string

    @IsOptional()
    @IsUUID()
    institution_id?: string | null
}
