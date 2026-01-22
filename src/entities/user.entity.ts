export class User {
    id: string
    fullname: string
    username: string
    email: string
    password?: string // Opcional para no exponer en respuestas
    role: string
    institution_id?: string | null
    updated_at: string
    created_at: string
}
