import { IsString, IsNotEmpty, IsUUID, ValidateNested, IsObject } from "class-validator";
import { IsMapNotEmpty, RecordDto } from "./record.dto";
import { Type } from "class-transformer";

export class CreateFilledFormDto {
    @IsString({ message: 'form_id must be a string.' })
    @IsUUID('4', { message: 'form_id must be a valid UUID.' })
    @IsNotEmpty({ message: 'form_id is required.' })
    form_id: string;

    @IsString({ message: 'shape_id must be a string.' })
    @IsUUID('4', { message: 'shape_id must be a valid UUID.' })
    @IsNotEmpty({ message: 'shape_id is required.' })
    shape_id: string;

    @Type(() => RecordDto)
    @ValidateNested({ each: true })
    @IsObject({ message: 'records must be an object.' })
    @IsMapNotEmpty({ message: 'records is required.' })
    records: Map<string, RecordDto>;

    @IsString({ message: 'title must be a string.' })
    @IsNotEmpty({ message: 'title is required.' })
    title: string;
}

