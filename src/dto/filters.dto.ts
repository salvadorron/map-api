import { ArrayNotEmpty, IsArray, IsOptional, IsString } from "class-validator";

export class ParrishFilters {
    @IsOptional()
    @IsString()
    municipality_id?: string
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

}
export class FormFilters {
    @IsOptional()
    @IsString({ each: true })
    category_ids?: string
}