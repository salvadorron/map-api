import { Type } from "class-transformer"
import { IsNotEmpty, IsObject, IsOptional, ValidateNested } from "class-validator"
import { type GeoJsonProperties, type Geometry } from "geojson"
import { GeometryDto } from "./geometry.dto"
export class CreateShapeDto {
    @IsOptional()
    @IsObject()
    properties: GeoJsonProperties
    
    @IsNotEmpty()
    @Type(() => GeometryDto)
    @ValidateNested()
    geom: Geometry
}
