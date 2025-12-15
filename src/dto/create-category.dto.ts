import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCategoryDto {
    @IsString({ message: 'name is required.' })
    name: string

    @IsOptional()
    @IsString()
    icon?: string

    @IsOptional()
    @IsString()
    color?: string

    @IsOptional()
    @IsUUID('4', { message: 'parent_id must be a valid UUID.' })
    parent_id?: string

    @IsOptional()
    @IsString()
    element_type?: string
}
