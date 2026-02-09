import { Type } from "class-transformer";
import { IsBoolean, IsBooleanString, IsNumber, IsOptional, IsString } from "class-validator";

export class ParrishFilters {
    @IsOptional()
    @IsString()
    municipalityIds?: string
}

export class FilledFormFilters {
    @IsOptional()
    @IsString()
    shape_id?: string
}

export class CategoryFilters {
    @IsOptional()
    @IsString({ each: true })
    parent_ids?: string

    @IsOptional()
    @IsBooleanString()
    is_public?: string = 'false'

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 3

    @IsOptional()
    @IsString()
    searchTerm?: string

    @IsOptional()
    @IsString()
    name?: string
}

export class UserFilters {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10

    @IsOptional()
    @IsString()
    searchTerm?: string
}

export class LogFilters {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 25
}

export class FormFilters {
    @IsOptional()
    @IsString({ each: true })
    category_ids?: string
}

export class ShapeFilters {

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_public?: boolean

    @IsOptional()
    @IsString()
    status?: string

    @IsOptional()
    @IsString()
    category_ids?: string

    @IsOptional()
    @IsString()
    // parrish_ids removed — parroquia filters are not used anymore

    @IsOptional()
    @IsString()
    municipality_ids?: string
}