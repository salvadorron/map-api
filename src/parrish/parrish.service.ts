import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { UUID } from 'src/helpers/uuid';
import { Parrish } from './entities/parrish.entity';

@Injectable()
export class ParrishService {
  constructor(private readonly db: PgService) {}

  async findAll() {
    return this.db.runInTransaction(async (client) => {
      const result = await client.query<Parrish>('SELECT * FROM public.parrishes');
      return result.rows;
    })
  }

  async findOne(id: string) {
    const parrishId = UUID.fromString(id);
    const parrish = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Parrish>('SELECT * FROM public.parrishes WHERE id = $1', [parrishId.getValue()]);
      if(result.rowCount === 0) throw new NotFoundException(`Parrish with ID ${id} not found.`)
      return result.rows[0];
    })
    return parrish;
  }
}
