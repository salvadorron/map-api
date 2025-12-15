import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateFormDto } from 'src/dto/create-form.dto';
import { FormFilters } from 'src/dto/filters.dto';
import { UpdateFormDto } from 'src/dto/update-form.dto';
import { Form } from 'src/entities/form.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class FormService {
  constructor(private readonly db: PgService) { }

  async create(createFormDto: CreateFormDto) {
    const { inputs, title, category_ids, tag } = createFormDto;
    const formId = UUID.create();
    const form = await this.db.runInTransaction(async (client) => {
      // Insertar el formulario
      const result = await client.query<Form>(
        'INSERT INTO public.forms (id, inputs, title, tag, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
        [formId.getValue(), inputs, title, tag, new Date(), new Date()]
      );
      
      // Insertar las relaciones con categorías
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO public.form_category_assignment (form_id, category_id) VALUES($1,$2)',
          [formId.getValue(), UUID.fromString(categoryId).getValue()]
        );
      }
      
      return result.rows[0];
    })
    return form;
  }

  async findAll(filters: FormFilters = {}) {
    const forms = await this.db.runInTransaction(async (client) => {
      const { query, values } = this.buildQuery(filters);
      const result = await client.query<Form>(query, values);
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
    const { category_ids, ...otherFields } = updateFormDto;
    const keys = Object.keys(otherFields);
    const values = Object.values(otherFields);

    if (keys.length === 0 && !category_ids) throw new BadRequestException('Must be at least one property to patch')

    const form = await this.db.runInTransaction(async (client) => {
      // Actualizar campos directos del formulario
      if (keys.length > 0) {
        const setString = keys.map((key, index) => {
          return `"${key}" = $${index + 1}`;
        }).join(', ');

        const updateValues = [...values, new Date(), formId.getValue()];
        const query = `
          UPDATE public.forms
          SET ${setString}, updated_at = $${values.length + 1}
          WHERE id = $${values.length + 2}
          RETURNING *
        `;
        await client.query<Form>(query, updateValues);
      }

      // Actualizar relaciones con categorías si se proporciona category_ids
      if (category_ids !== undefined) {
        // Eliminar relaciones existentes
        await client.query(
          'DELETE FROM public.form_category_assignment WHERE form_id = $1',
          [formId.getValue()]
        );

        // Insertar nuevas relaciones
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO public.form_category_assignment (form_id, category_id) VALUES($1,$2)',
            [formId.getValue(), UUID.fromString(categoryId).getValue()]
          );
        }
      }

      // Retornar el formulario actualizado
      const result = await client.query<Form>('SELECT * FROM public.forms WHERE id = $1', [formId.getValue()]);
      if (result.rowCount === 0) throw new NotFoundException(`Form with ID ${id} not found.`)
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

  private buildQuery = (filters: FormFilters = {}) => {
    if (filters.category_ids) {
      const splittedCategories = filters.category_ids.split(',')
      return {
        query: `
          SELECT DISTINCT f.* FROM public.forms f
          INNER JOIN public.form_category_assignment fca ON f.id = fca.form_id
          WHERE fca.category_id = ANY($1::uuid[])
        `,
        values: [splittedCategories]
      }
    }
    return { query: 'SELECT * FROM public.forms', values: undefined }
  }
}
