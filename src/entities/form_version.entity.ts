import { InputDto } from "../dto/input.dto";

export class FormVersion {
    id: string;
    form_id: string;
    version_number: number;
    inputs: InputDto[];
    title: string;
    tag?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
