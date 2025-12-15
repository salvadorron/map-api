import { GeoJsonProperties, Geometry } from "geojson"

export class Shape {
    id: string
    properties: GeoJsonProperties
    geom: Geometry
    institution_id?: string | null
    is_public: boolean
    created_at: string
    updated_at: string
}