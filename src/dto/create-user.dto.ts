import { IsString, IsUUID, IsOptional, IsEnum } from "class-validator";

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN_USER = 'ADMIN_USER',
    OPERATOR_USER = 'OPERATOR_USER',
}

export class CreateUserDto {
    @IsString()
    fullname: string

    @IsString()
    username: string

    @IsString()
    email: string

    @IsString()
    password: string

    @IsEnum(UserRole)
    role: string

    @IsOptional()
    @IsUUID()
    institution_id?: string | null
}
