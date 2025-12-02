import { Type } from "class-transformer"
import { IsNotEmpty, IsObject, IsOptional, IsUUID, ValidateNested } from "class-validator"
import { type GeoJsonProperties, type Geometry } from "geojson"
import { GeometryDto } from "./geometry.dto"
export class CreateShapeDto {
    @IsUUID()
    @IsNotEmpty()
    category_id: string

    @IsOptional()
    @IsObject()
    properties: GeoJsonProperties
    
    @IsNotEmpty()
    @Type(() => GeometryDto)
    @ValidateNested()
    geom: Geometry
}
