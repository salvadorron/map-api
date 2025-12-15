export class FilledForm {
    id: string;
    form_id: string;
    shape_id: string;
    records: Record<string, any>;
    title: string;
    user_id?: string | null;
    created_at: string;
    updated_at: string;
}
