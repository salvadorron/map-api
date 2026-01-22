import { GeoJsonProperties, Geometry } from "geojson"

export class Shape {
    id: string
    properties: GeoJsonProperties
    geom: Geometry
    institution_id?: string | null
    status: string
    created_at: string
    updated_at: string
}