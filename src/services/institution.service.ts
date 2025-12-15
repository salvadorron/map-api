import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateInstitutionDto } from 'src/dto/create-institution.dto';
import { UpdateInstitutionDto } from 'src/dto/update-institution.dto';
import { Institution } from 'src/entities/institution.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class InstitutionService {
  constructor(readonly db: PgService) {}

  async create(createInstitutionDto: CreateInstitutionDto) {
    const institutionId = UUID.create();
    const institution = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Institution>(
        'INSERT INTO public.institutions (id, code, name, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING *',
        [institutionId.getValue(), createInstitutionDto.code, createInstitutionDto.name, new Date(), new Date()]
      );
      return result.rows[0];
    });
    return institution;
  }

  async findAll() {
    const institutions = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Institution>('SELECT * FROM public.institutions ORDER BY name');
      return result.rows;
    });
    return institutions;
  }

  async findOne(id: string) {
    const institutionId = UUID.fromString(id);
    const institution = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Institution>(
        'SELECT * FROM public.institutions WHERE id = $1',
        [institutionId.getValue()]
      );
      return result.rows[0];
    });
    if (!institution) {
      throw new NotFoundException(`Institución con id ${id} no encontrada`);
    }
    return institution;
  }

  async findByCode(code: string) {
    const institution = await this.db.query(
      'SELECT * FROM public.institutions WHERE code = $1',
      [code]
    );
    return institution.rows[0] || null;
  }

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto) {
    const institutionId = UUID.fromString(id);
    const keys = Object.keys(updateInstitutionDto);
    const values = Object.values(updateInstitutionDto);

    if (keys.length === 0) {
      throw new BadRequestException('Debe haber al menos una propiedad para actualizar');
    }

    const institution = await this.db.runInTransaction(async (client) => {
      const updates: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      keys.forEach(key => {
        updates.push(`"${key}" = $${paramIndex}`);
        updateValues.push(updateInstitutionDto[key]);
        paramIndex++;
      });

      updates.push(`updated_at = NOW()`);
      updateValues.push(institutionId.getValue());

      const query = `
        UPDATE public.institutions
        SET ${updates.join(', ')}
        WHERE "id" = $${paramIndex}
        RETURNING *
      `;
      const result = await client.query<Institution>(query, updateValues);
      if (result.rowCount === 0) {
        throw new NotFoundException(`Institución con ID ${id} no encontrada.`);
      }
      return result.rows[0];
    });
    return institution;
  }

  async remove(id: string) {
    const institutionId = UUID.fromString(id);
    const deletedInstitution = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<Institution, 'id'>>(
        'DELETE FROM public.institutions WHERE id = $1 RETURNING id',
        [institutionId.getValue()]
      );
      return result.rows[0];
    });
    if (!deletedInstitution) {
      throw new NotFoundException('Institución no encontrada');
    }
    return { message: `Institución con ID: (${deletedInstitution.id}) ha sido eliminada exitosamente!` };
  }
}
