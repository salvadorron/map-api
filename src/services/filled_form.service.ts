import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateFilledFormDto } from 'src/dto/create-filled_form.dto';
import { FilledFormFilters } from 'src/dto/filters.dto';
import { UpdateFilledFormDto } from 'src/dto/update-filled_form.dto';
import { FilledForm } from 'src/entities/filled_form.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class FilledFormService {
  constructor(private readonly db: PgService) { }
  async create(createFilledFormDto: CreateFilledFormDto) {
    const { form_id, shape_id, records, title, user_id } = createFilledFormDto;
    const recordsObject = Object.fromEntries(records.entries());
    const filledFormId = UUID.create();
    const userIdValue = user_id ? UUID.fromString(user_id).getValue() : null;
    const filledForm = await this.db.runInTransaction(async (client) => {
      const result = await client.query<FilledForm>(
        'INSERT INTO public.filled_forms (id, form_id, shape_id, records, title, user_id, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [filledFormId.getValue(), form_id, shape_id, recordsObject, title, userIdValue, new Date(), new Date()]
      );
      return result.rows[0];
    })
    return filledForm;
  }

  findAll(filters: FilledFormFilters = {}) {
    const { query, values } = this.buildQuery(filters);
    return this.db.runInTransaction(async (client) => {
      const result = await client.query<FilledForm[]>(query, values);
      return result.rows;
    })
  }

  findOne(id: string) {
    const filledFormId = UUID.fromString(id);
    return this.db.runInTransaction(async (client) => {
      const result = await client.query<FilledForm>('SELECT * FROM public.filled_forms WHERE id = $1', [filledFormId.getValue()]);
      if (result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
  }

  async update(id: string, updateFilledFormDto: UpdateFilledFormDto) {
    const filledFormId = UUID.fromString(id);
    const { user_id, records, ...otherFields } = updateFilledFormDto;
    const keys = Object.keys(otherFields);
    const values: any[] = [];

    if (keys.length === 0 && user_id === undefined && records === undefined) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    const filledForm = await this.db.runInTransaction(async (client) => {
      const updates: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Manejar campos normales
      keys.forEach(key => {
        updates.push(`"${key}" = $${paramIndex}`);
        updateValues.push(otherFields[key]);
        paramIndex++;
      });

      // Manejar records (convertir Map a objeto si es necesario)
      if (records !== undefined) {
        updates.push(`records = $${paramIndex}`);
        const recordsObject = records instanceof Map ? Object.fromEntries(records.entries()) : records;
        updateValues.push(recordsObject);
        paramIndex++;
      }

      // Manejar user_id con conversión a UUID
      if (user_id !== undefined) {
        updates.push(`user_id = $${paramIndex}`);
        updateValues.push(user_id ? UUID.fromString(user_id).getValue() : null);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);
      updateValues.push(filledFormId.getValue());

      const query = `
        UPDATE public.filled_forms
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      const result = await client.query<FilledForm>(query, updateValues);
      if (result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
    return filledForm;
  }

  async remove(id: string) {
    const filledFormId = UUID.fromString(id);
    const filledForm = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<FilledForm, 'id'>>('DELETE FROM public.filled_forms WHERE id = $1 RETURNING id', [filledFormId.getValue()]);
      if (result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
    return { message: `Filled form with ID: (${filledForm.id}) has deleted successfully!` };
  }



  private buildQuery(filters: FilledFormFilters = {}) {
    if(filters.shape_id) {
      return { query: 'SELECT * FROM public.filled_forms WHERE shape_id = $1', values: [filters.shape_id] }
    }
    return { query: 'SELECT * FROM public.filled_forms', values: undefined }
  }
}
