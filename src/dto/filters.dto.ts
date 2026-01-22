import { IsBoolean, IsBooleanString, IsOptional, IsString } from "class-validator";

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
}

export class FormFilters {
    @IsOptional()
    @IsString({ each: true })
    category_ids?: string
}

export class ShapeFilters {

    @IsOptional()
    @IsString()
    status?: string


    @IsOptional()
    @IsString()
    category?: string

    @IsOptional()
    @IsString()
    municipality?: string
}