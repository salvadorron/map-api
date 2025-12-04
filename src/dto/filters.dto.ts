import { IsOptional, IsString } from "class-validator";

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