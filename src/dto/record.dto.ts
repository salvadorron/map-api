import { IsIn, IsNotEmpty, IsString, registerDecorator, ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint, ValidationOptions, IsOptional, IsArray } from "class-validator";

@ValidatorConstraint({ async: false })
export class IsMapNotEmptyConstraint implements ValidatorConstraintInterface {
    validate(map: any, args: ValidationArguments) {
        if (typeof map !== 'object' || map === null) {
            return false;
        }

        return map.size > 0; 
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} cannot be empty. It must contain at least one key.`;
    }
}

export function IsMapNotEmpty(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsMapNotEmptyConstraint,
        });
    };
}

export class RecordDto {
    @IsNotEmpty({ message: 'value is required.' })
    value: string | string[];

    @IsString({ message: 'label must be a string.' })
    @IsNotEmpty({ message: 'label is required.' })
    label: string;

    @IsString({ message: 'type must be a string.' })
    @IsOptional()
    @IsIn(['textarea', 'date', 'text', 'number', 'select', 'checkbox'], { message: 'type must be one of the following: textarea, date, text, number, select, checkbox.' })
    type?: string;
}