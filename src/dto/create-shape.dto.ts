import { Type } from "class-transformer"
import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator"
import { type GeoJsonProperties, type Geometry } from "geojson"
import { GeometryDto } from "./geometry.dto"
export class CreateShapeDto {
    @IsArray({ message: 'category_ids must be array' })
    @ArrayNotEmpty()
    @IsUUID('4', { each: true })
    category_ids: string[]

    @IsOptional()
    @IsObject()
    properties: GeoJsonProperties

    @IsOptional()
    @IsString()
    status?: string

    @IsNotEmpty()
    @Type(() => GeometryDto)
    @ValidateNested()
    geom: Geometry

    @IsOptional()
    @IsUUID('4')
    institution_id?: string | null
}
