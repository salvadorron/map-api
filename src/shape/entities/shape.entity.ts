import { GeoJsonProperties, Geometry } from "geojson"

export class Shape {
    id: string
    properties: GeoJsonProperties
    geom: Geometry
    created_at: string
    updated_at: string
}

export class DeletedShape {
    id: string
}