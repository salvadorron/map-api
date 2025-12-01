import { IsOptional, IsString } from "class-validator";

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
    @IsString()
    parent_id?: string

    @IsOptional()
    @IsString()
    element_type?: string
}
