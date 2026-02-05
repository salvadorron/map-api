import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { UUID } from 'src/helpers/uuid';
import { LogModel } from 'src/models/log.model';

@Injectable()
export class LogService {
  private _logModel: LogModel;

  constructor(private readonly db: PgService) {
    this._logModel = new LogModel(this.db);
  }

  async create(data: {
    action: string;
    resource_type: string;
    resource_id?: string | null;
    user_id?: string | null;
    details?: Record<string, any> | null;
    ip_address?: string | null;
    user_agent?: string | null;
  }) {
    const logId = UUID.create();
    await this._logModel.create({
      id: logId.getValue(),
      action: data.action,
      resource_type: data.resource_type,
      resource_id: data.resource_id ? UUID.fromString(data.resource_id).getValue() : null,
      user_id: data.user_id ? UUID.fromString(data.user_id).getValue() : null,
      details: data.details ? JSON.stringify(data.details) as any : null,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    })
  }

  async findAll() {
    const logs = await this._logModel.findAll({
      order: {
        created_at: 'DESC',
      },
      limit: 25,
    });
    return logs;
  }
}

