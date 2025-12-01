import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PgService } from 'src/database/pg-config.service';
import { UUID } from 'src/helpers/uuid';
import { Form } from './entities/form.entity';

@Injectable()
export class FormService {
  constructor(private readonly db: PgService) {}

  async create(createFormDto: CreateFormDto) {
    const { inputs, title, category_id, tag } = createFormDto;
    const formId = UUID.create();
    const form = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Form>('INSERT INTO public.forms (id, inputs, title, category_id, tag, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [formId.getValue(), inputs, title, category_id, tag, new Date(), new Date()]);
      return result.rows[0];
    })
    return form;
  }

  async findAll() {
    const forms = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Form>('SELECT * FROM public.forms');
      return result.rows;
    })
    return forms;
  }

  async findOne(id: string) {
    const formId = UUID.fromString(id);
    const form = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Form>('SELECT * FROM public.forms WHERE id = $1', [formId.getValue()]);
      return result.rows[0];
    })
    if (!form) throw new NotFoundException('Form not found')
    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto) {
    const formId = UUID.fromString(id);
    const keys = Object.keys(updateFormDto);
    const values = Object.values(updateFormDto);

    if(keys.length === 0 || values.length === 0) throw new BadRequestException('Must be at least one property to patch')

    const setString = keys.map((key, index) => {
      return `"${key}" = $${index + 1}`;
    }).join(', ');

    values.push(new Date());
    values.push(formId.getValue())

    const form = await this.db.runInTransaction(async (client) => {
      const query = `
        UPDATE public.forms
        SET ${setString}, updated_at = $${values.length - 1}
        WHERE id = $${values.length}
        RETURNING *
      `;
      const result = await client.query<Form>(query, values);
      if(result.rowCount === 0) throw new NotFoundException(`Form with ID ${id} not found.`)
      return result.rows[0];
    })
    return form;
  }

  async remove(id: string) {
    const formId = UUID.fromString(id);
    const form = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<Form, 'id'>>('DELETE FROM public.forms WHERE id = $1 RETURNING id', [formId.getValue()]);
      return result.rows[0];
    })
    if (!form) throw new NotFoundException('Form not found')
    return { message: `Form with ID: (${form.id}) has deleted successfully!` };
  }
}
