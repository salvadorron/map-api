import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { Municipality } from 'src/entities/municipality.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class MunicipalityService {

  constructor(private readonly db: PgService) {}

  findAll() {
    return this.db.runInTransaction(async (client) => {
      const result = await client.query<Municipality>('SELECT * FROM public.municipalities');
      return result.rows;
    })
  }

  async findOne(id: string) {
    const municipalityId = UUID.fromString(id);
    const municipality = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Municipality>('SELECT * FROM public.municipalities WHERE id = $1', [municipalityId.getValue()]);
      if(result.rowCount === 0) throw new NotFoundException(`Municipality with ID ${id} not found.`)
      return result.rows[0];
    })

    return municipality;
  }

}
