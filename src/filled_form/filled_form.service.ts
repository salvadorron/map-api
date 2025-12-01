import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFilledFormDto } from './dto/create-filled_form.dto';
import { UpdateFilledFormDto } from './dto/update-filled_form.dto';
import { PgService } from 'src/database/pg-config.service';
import { FilledForm } from './entities/filled_form.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class FilledFormService {
  constructor(private readonly db: PgService) {}
  async create(createFilledFormDto: CreateFilledFormDto) {
    const { form_id, shape_id, records, title } = createFilledFormDto;
    const recordsObject = Object.fromEntries(records.entries());
    const filledFormId = UUID.create();
    const filledForm = await this.db.runInTransaction(async (client) => {
      const result = await client.query<FilledForm>('INSERT INTO public.filled_forms (id, form_id, shape_id, records, title, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [filledFormId.getValue(), form_id, shape_id, recordsObject, title, new Date(), new Date()]);
      return result.rows[0];
    })
    return filledForm;
  }

  findAll() {
    return this.db.runInTransaction(async (client) => {
      const result = await client.query<FilledForm[]>('SELECT * FROM public.filled_forms');
      return result.rows;
    })
  }

  findOne(id: string) {
    const filledFormId = UUID.fromString(id);
    return this.db.runInTransaction(async (client) => {
      const result = await client.query<FilledForm>('SELECT * FROM public.filled_forms WHERE id = $1', [filledFormId.getValue()]);
      if(result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
  }

  async update(id: string, updateFilledFormDto: UpdateFilledFormDto) {

    const filledFormId = UUID.fromString(id);

    const keys = Object.keys(updateFilledFormDto);
    const values = Object.values(updateFilledFormDto)
    .map((value) => value instanceof Map ? Object.fromEntries(value.entries()) : value);

    if(keys.length === 0 || values.length === 0) throw new BadRequestException('Must be at least one property to patch')

    const setString = keys.map((key, index) => {
      return `"${key}" = $${index + 1}`;
    }).join(', ');

    values.push(new Date());
    values.push(filledFormId.getValue())

    const filledForm = await this.db.runInTransaction(async (client) => {
      const query = `
        UPDATE public.filled_forms
        SET ${setString}, updated_at = $${values.length - 1}
        WHERE id = $${values.length}
        RETURNING *
      `;
      const result = await client.query<FilledForm>(query, values);
      if(result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
    return filledForm;
  }

  async remove(id: string) {
    const filledFormId = UUID.fromString(id);
    const filledForm = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<FilledForm, 'id'>>('DELETE FROM public.filled_forms WHERE id = $1 RETURNING id', [filledFormId.getValue()]);
      if(result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
    return { message: `Filled form with ID: (${filledForm.id}) has deleted successfully!` };
  }
}
