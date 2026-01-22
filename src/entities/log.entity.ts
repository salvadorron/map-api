export class Log {
    id: string
    action: string
    resource_type: string
    resource_id?: string | null
    user_id?: string | null
    details?: Record<string, any> | null
    ip_address?: string | null
    user_agent?: string | null
    created_at: string
}

