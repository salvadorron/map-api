import { InputDto } from "../dto/input.dto";

export class Form {
    id: string;
    inputs: InputDto[];
    title: string;
    tag?: string;
    created_at: string;
    updated_at: string;
}
