import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { UUID } from 'src/helpers/uuid';
import { QueryConfig } from 'pg';
import { ParrishFilters } from 'src/dto/filters.dto';
import { Parrish } from 'src/entities/parrish.entity';

@Injectable()
export class ParrishService {
  constructor(private readonly db: PgService) { }

  private buildQuery = (filters: ParrishFilters = {}) => {
    if(filters.municipalityIds && filters.municipalityIds.includes('ALL')) {
      filters.municipalityIds = undefined;
    }

    if (filters.municipalityIds) {
      const ids = filters.municipalityIds.split(',').map(id => id.trim());
      return { query: 'SELECT * FROM public.parrishes WHERE municipality_id = ANY($1::uuid[])', values: [ids] };
    }
    return { query: 'SELECT * FROM public.parrishes', values: undefined }
  }

  async findAll(filters: ParrishFilters = {}) {
    console.log(filters);
    const { query, values } = this.buildQuery(filters);

    return this.db.runInTransaction(async (client) => {
      const result = await client.query<Parrish>(query, values);
      return result.rows;
    })
  }

  async findOne(id: string) {
    const parrishId = UUID.fromString(id);
    const parrish = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Parrish>('SELECT * FROM public.parrishes WHERE id = $1', [parrishId.getValue()]);
      if (result.rowCount === 0) throw new NotFoundException(`Parrish with ID ${id} not found.`)
      return result.rows[0];
    })
    return parrish;
  }
}
