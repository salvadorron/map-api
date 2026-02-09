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
    const sanitizedDetails = this.sanitizeDetails(data.details);

    await this._logModel.create({
      id: logId.getValue(),
      action: data.action,
      resource_type: data.resource_type,
      resource_id: data.resource_id ? UUID.fromString(data.resource_id).getValue() : null,
      user_id: data.user_id ? UUID.fromString(data.user_id).getValue() : null,
      details: sanitizedDetails as any,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
    })
  }

  private sanitizeDetails(details?: Record<string, any> | null, maxLen = 1000): string | null {
    if (!details) return null;

    const clone: any = {};
    for (const key of Object.keys(details)) {
      const val = details[key];
      if (val === undefined || val === null) continue;

      if (key === 'password' || key.toLowerCase().includes('token')) {
        continue; // never store sensitive fields
      }

      if (typeof val === 'string') {
        clone[key] = val.length > 200 ? val.slice(0, 200) + '... (truncated)' : val;
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        clone[key] = val;
      } else if (Array.isArray(val)) {
        clone[key] = `[Array(${val.length})]`;
      } else if (typeof val === 'object') {
        clone[key] = '[Object]';
      } else {
        clone[key] = String(val);
      }
    }

    try {
      let str = JSON.stringify(clone);
      if (str.length > maxLen) str = str.slice(0, maxLen) + '... (truncated)';
      return str as any;
    } catch (err) {
      return null;
    }
  }
  async findAll(filters: { page?: number; limit?: number } = { page: 1, limit: 25 }) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 25;
    const offset = (page - 1) * limit;

    const result = await this._logModel.findAndCountAll({
      include: [{ relation: 'user', include: ['institution'] } as any],
      order: { created_at: 'DESC' },
      limit,
      offset,
    });

    const total = result.count || 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    return {
      data: result.rows,
      metadata: {
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        total,
      },
    };
  }
}

