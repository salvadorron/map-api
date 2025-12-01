import { IsArray, IsIn, IsNotEmpty, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { type Geometry } from "geojson";

@ValidatorConstraint({ name: 'GeoJSONCoordinates', async: false })
class GeoJSONCoordinates implements ValidatorConstraintInterface {

    private _validatePosition = (coord: any[]): boolean => Array.isArray(coord) && coord.length >= 2 && coord.every(c => typeof c === 'number')

    private _constraints: Record<string, (coordinates: any[]) => boolean> = {
        'Point': (coordinates) => {
            return coordinates.length >= 2 && this._validatePosition(coordinates);
        },
        'LineString': (coordinates) => {
            return coordinates.length >= 2 && coordinates.every(this._validatePosition);
        },
        'MultiPoint': (coordinates) => {
            return coordinates.length >= 1 && coordinates.every(this._validatePosition);
        },
        'Polygon': (coordinates) => {
            if (coordinates.length < 1) return false;
            return coordinates.every((ring: any) =>
                Array.isArray(ring) &&
                ring.length >= 4 &&
                ring.every(this._validatePosition)
            );
        },
        'MultiLineString': (coordinates) => {
            if (coordinates.length < 1) return false;
            return coordinates.every((line: any) =>
                Array.isArray(line) &&
                line.length >= 2 &&
                line.every(this._validatePosition)
            );
        },
        'MultiPolygon': (coordinates) => {
            if (coordinates.length < 1) return false;
            return coordinates.every((polygon: any) => {
                if (!Array.isArray(polygon) || polygon.length < 1) return false;

                return polygon.every((ring: any) =>
                    Array.isArray(ring) &&
                    ring.length >= 4 &&
                    ring.every(this._validatePosition)
                )
            }
            );
        },
        'GeometryCollection': () => {
            return true;
        }
    }

    validate(coordinates: any, validationArguments: ValidationArguments): Promise<boolean> | boolean {
        const { object } = validationArguments;
        const type = object['type'];

        if (!type || !coordinates || !Array.isArray(coordinates)) return true;

        const validateCoords = this._constraints[type];
        return validateCoords?.(coordinates);

    }

    defaultMessage(validationArguments: ValidationArguments): string {
        const object = validationArguments.object
        const type = object['type'] || 'unknown type';

        return `The coordinate structure or length for type '${type}' is incorrect according to the GeoJSON specification.`
    }

}

export class GeometryDto {
    @IsNotEmpty({ message: "the geometry type is required." })
    @IsIn(['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'], {
        message: "the geometry type isn't valid according to GeoJSON."
    })
    type: Geometry

    @IsNotEmpty({ message: 'the coordinates are required.' })
    @Validate(GeoJSONCoordinates)
    @IsArray({ message: 'the coordinates must be array. ' })
    coordinates: any
}