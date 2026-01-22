import { BadRequestException, Injectable, NotFoundException, Options } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateFormDto } from 'src/dto/create-form.dto';
import { FormFilters } from 'src/dto/filters.dto';
import { UpdateFormDto } from 'src/dto/update-form.dto';
import { Form } from 'src/entities/form.entity';
import { FormVersion } from 'src/entities/form_version.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class FormService {
  constructor(private readonly db: PgService) { }

  async create(createFormDto: CreateFormDto) {
    const { inputs, title, category_ids, tag } = createFormDto;
    
    const formId = UUID.create();
    const formVersionId = UUID.create();
    const form = await this.db.runInTransaction(async (client) => {
      // Insertar el formulario base (sin inputs)
      const formResult = await client.query<Form>(
        `INSERT INTO public.forms (id, title, tag, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [formId.getValue(), title, tag, new Date(), new Date()]
      );
      
      await client.query<FormVersion>(
        `INSERT INTO public.form_versions (id, form_id, version_number, inputs, title, tag, is_active, created_at, updated_at) 
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          formVersionId.getValue(),
          formId.getValue(),
          1,
          inputs,
          title,
          tag,
          true,
          new Date(),
          new Date()
        ]
      );

      // Insertar las relaciones con categorías
      for (const categoryId of category_ids) {
        await client.query(
          'INSERT INTO public.form_category_assignment (form_id, category_id) VALUES($1,$2)',
          [formId.getValue(), UUID.fromString(categoryId).getValue()]
        );
      }

      return formResult.rows[0];
    })
    return form;
  }

  async findAll(filters: FormFilters = {}) {
    const forms = await this.db.runInTransaction(async (client) => {
      const { query, values } = this.buildQuery(filters);
      const result = await client.query<Form>(query, values);
      const formsWithVersions = await Promise.all(
        result.rows.map(async (form) => {
          const versionResult = await client.query<FormVersion>(
            `SELECT * FROM public.form_versions WHERE form_id = $1 AND is_active = TRUE ORDER BY version_number DESC LIMIT 1`,
            [form.id]
          );

          const categoriesResult = await client.query<{ id: string; name: string; icon?: string; color?: string; parent_id?: string; element_type?: string; created_at: string; updated_at: string }>(
            `SELECT c.* FROM public.categories c
             INNER JOIN public.form_category_assignment fca ON c.id = fca.category_id
             WHERE fca.form_id = $1`,
            [form.id]
          );

          return {
            ...form,
            active_version: versionResult.rows[0] || null,
            categories: categoriesResult.rows
          };
        })
      );
      return formsWithVersions;
    })
    return forms;
  }

  async findOne(id: string) {
    const formVersionId = UUID.fromString(id);
    const versionResult = await this.db.runInTransaction(async (client) => {
      const result = await client.query<FormVersion>('SELECT * FROM public.form_versions WHERE id = $1', [formVersionId.getValue()]);
      if (!result.rows[0]) return null;
      
      const formResult = await client.query<Form>(
        `SELECT * FROM public.forms WHERE id = $1`,
        [result.rows[0].form_id]
      );
      
      const categoriesResult = await client.query<{ id: string; name: string; icon?: string; color?: string; parent_id?: string; element_type?: string; created_at: string; updated_at: string }>(
        `SELECT c.* FROM public.categories c
         INNER JOIN public.form_category_assignment fca ON c.id = fca.category_id
         WHERE fca.form_id = $1`,
        [result.rows[0].form_id]
      );
      
      return {
        ...formResult.rows[0],
        active_version: result.rows[0] || null,
        categories: categoriesResult.rows
      };
    })
    if (!versionResult) throw new NotFoundException('Form not found')
    return versionResult;
  }

  async update(id: string, updateFormDto: UpdateFormDto) {
    const formId = UUID.fromString(id);
    const { category_ids, inputs, title, tag, ...otherFields } = updateFormDto;
    const keys = Object.keys(otherFields);
    const values = Object.values(otherFields);

    if (keys.length === 0 && !category_ids && !inputs && title === undefined && tag === undefined) {
      throw new BadRequestException('Must be at least one property to patch')
    }

    const form = await this.db.runInTransaction(async (client) => {
      // Verificar que el formulario existe
      const formCheck = await client.query<Form>('SELECT * FROM public.forms WHERE id = $1', [formId.getValue()]);
      if (formCheck.rowCount === 0) throw new NotFoundException(`Form with ID ${id} not found.`)

      const currentForm = formCheck.rows[0];
      
      // Si se modifican inputs, title o tag, crear una nueva versión
      const needsNewVersion = inputs !== undefined || title !== undefined || tag !== undefined;
      
      if (needsNewVersion) {
        // Obtener el número de versión más alto
        const maxVersionResult = await client.query<{ max: number }>(
          'SELECT COALESCE(MAX(version_number), 0) as max FROM public.form_versions WHERE form_id = $1',
          [formId.getValue()]
        );
        const nextVersionNumber = (maxVersionResult.rows[0]?.max || 0) + 1;

        // Desactivar todas las versiones anteriores
        await client.query(
          'UPDATE public.form_versions SET is_active = FALSE WHERE form_id = $1',
          [formId.getValue()]
        );

        // Obtener los valores para la nueva versión (usar los nuevos o los actuales)
        const newTitle = title !== undefined ? title : currentForm.title;
        const newTag = tag !== undefined ? tag : currentForm.tag;
        const newInputs = inputs !== undefined ? inputs : [];

        // Si no se proporcionan inputs, obtener los de la versión activa anterior
        let inputsToUse = newInputs;
        if (inputs === undefined) {
          const lastVersionResult = await client.query<FormVersion>(
            'SELECT inputs FROM public.form_versions WHERE form_id = $1 ORDER BY version_number DESC LIMIT 1',
            [formId.getValue()]
          );
          if (lastVersionResult.rows[0]) {
            inputsToUse = lastVersionResult.rows[0].inputs;
          }
        }

        // Crear nueva versión
        const formVersionId = UUID.create();

        await client.query<FormVersion>(
          `INSERT INTO public.form_versions (id, form_id, version_number, inputs, title, tag, is_active, created_at, updated_at) 
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            formVersionId.getValue(),
            formId.getValue(),
            nextVersionNumber,
            inputsToUse,
            newTitle,
            newTag,
            true,
            new Date(),
            new Date()
          ]
        );

        // Actualizar campos del formulario base si cambian title o tag
        if (title !== undefined || tag !== undefined) {
          const setParts: string[] = [];
          const updateValues: any[] = [];
          let paramIndex = 1;

          if (title !== undefined) {
            setParts.push(`title = $${paramIndex}`);
            updateValues.push(title);
            paramIndex++;
          }

          if (tag !== undefined) {
            setParts.push(`tag = $${paramIndex}`);
            updateValues.push(tag);
            paramIndex++;
          }

          setParts.push(`updated_at = $${paramIndex}`);
          updateValues.push(new Date());
          paramIndex++;
          updateValues.push(formId.getValue());

          await client.query<Form>(
            `UPDATE public.forms SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            updateValues
          );
        } else {
          // Solo actualizar updated_at
          await client.query<Form>(
            'UPDATE public.forms SET updated_at = $1 WHERE id = $2 RETURNING *',
            [new Date(), formId.getValue()]
          );
        }
      } else {
        // Solo actualizar campos que no requieren nueva versión
        if (keys.length > 0) {
          const setParts: string[] = [];
          const updateValues: any[] = [];
          let paramIndex = 1;

          keys.forEach((key) => {
            setParts.push(`"${key}" = $${paramIndex}`);
            updateValues.push(values[keys.indexOf(key)]);
            paramIndex++;
          });

          setParts.push(`updated_at = $${paramIndex}`);
          updateValues.push(new Date());
          paramIndex++;
          updateValues.push(formId.getValue());

          await client.query<Form>(
            `UPDATE public.forms SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            updateValues
          );
        }
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

      // Retornar el formulario actualizado con su versión activa
      const result = await client.query<Form>('SELECT * FROM public.forms WHERE id = $1', [formId.getValue()]);
      const versionResult = await client.query<FormVersion>(
        `SELECT * FROM public.form_versions WHERE form_id = $1 AND is_active = TRUE ORDER BY version_number DESC LIMIT 1`,
        [formId.getValue()]
      );

      return {
        ...result.rows[0],
        active_version: versionResult.rows[0] || null
      };
    })
    return form;
  }

  async remove(id: string) {
    const formId = UUID.fromString(id);
    const form = await this.db.runInTransaction(async (client) => {
      try {
        const result = await client.query<Pick<Form, 'id'>>('DELETE FROM public.forms WHERE id = $1 RETURNING id', [formId.getValue()]);
        return result.rows[0];
      } catch (error) {
        throw new NotFoundException(`This form is being used by a filled form.`)
      }
    })
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
