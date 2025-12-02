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
    if (filters.municipality_id) {
      const id = UUID.fromString(filters.municipality_id);
      return { query: 'SELECT * FROM public.parrishes WHERE municipality_id = $1', values: [id.getValue()] };
    }
    return { query: 'SELECT * FROM public.parrishes', values: undefined }
  }

  async findAll(filters: ParrishFilters = {}) {
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
