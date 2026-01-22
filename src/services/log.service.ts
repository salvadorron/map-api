import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { Log } from 'src/entities/log.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class LogService {
  constructor(private readonly db: PgService) {}

  async create(data: {
    action: string;
    resource_type: string;
    resource_id?: string | null;
    user_id?: string | null;
    details?: Record<string, any> | null;
    ip_address?: string | null;
    user_agent?: string | null;
  }) {
    if (!this.db) {
      console.error('PgService no está disponible en LogService');
      return;
    }

    const logId = UUID.create();
    await this.db.runInTransaction(async (client) => {
      await client.query(
        `INSERT INTO logs (id, action, resource_type, resource_id, user_id, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          logId.getValue(),
          data.action,
          data.resource_type,
          data.resource_id ? UUID.fromString(data.resource_id).getValue() : null,
          data.user_id ? UUID.fromString(data.user_id).getValue() : null,
          data.details ? JSON.stringify(data.details) : null,
          data.ip_address,
          data.user_agent,
        ]
      );
    });
  }

  async findAll() {
    const logs = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Log>(`
        SELECT 
          id,
          action,
          resource_type,
          resource_id,
          user_id,
          details,
          ip_address,
          user_agent,
          created_at
        FROM logs
        ORDER BY created_at DESC LIMIT 25
      `);

      return result.rows;
    });

    return logs;
  }
}

