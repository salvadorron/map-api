import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PgService } from 'src/database/pg-config.service';
import { CreateCategoryDto } from 'src/dto/create-category.dto';
import { CategoryFilters } from 'src/dto/filters.dto';
import { UpdateCategoryDto } from 'src/dto/update-category.dto';
import { Category } from 'src/entities/category.entity';
import { UUID } from 'src/helpers/uuid';
import { AlsStore } from 'src/modules/app.module';



@Injectable()
export class CategoryService {
  constructor(readonly db: PgService, private readonly als: AsyncLocalStorage<AlsStore>) { }
  async create(createCategoryDto: CreateCategoryDto) {
    const { name, color = null, element_type = null, icon = null, parent_id = null, institution_id = null } = createCategoryDto;
    const categoryId = UUID.create();
    const parentIdValue = parent_id ? UUID.fromString(parent_id).getValue() : null;
    const category = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Category>(
        'INSERT INTO public.categories (id, name, icon, color, parent_id, element_type, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [categoryId.getValue(), name, icon, color, parentIdValue, element_type, new Date(), new Date()]
      );

      if (institution_id) {
        await client.query('INSERT INTO public.institution_category_assignment (institution_id, category_id) VALUES($1,$2)', [institution_id, categoryId.getValue()]);
      }

      const categoryDone = result.rows[0]
      return categoryDone
    })
    return category;
  }

  async findAll(filters: CategoryFilters = { is_public: 'false' }) {
    const { query, values } = this.buildQuery(filters);
    const categories = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Category>(query, values);
      return result.rows;
    })
    return categories;
  }

  async findOne(id: string) {
    const categoryId = UUID.fromString(id);
    const category = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Category>('SELECT * FROM public.categories WHERE id = $1', [categoryId.getValue()]);
      return result.rows[0];
    })
    if (!category) throw new NotFoundException('Category not found')
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const categoryId = UUID.fromString(id);
    const { parent_id, ...otherFields } = updateCategoryDto;
    const keys = Object.keys(otherFields);
    const values = Object.values(otherFields);

    if (keys.length === 0 && parent_id === undefined) throw new BadRequestException('Must be at least one property to patch')

    const category = await this.db.runInTransaction(async (client) => {
      const updates: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Agregar campos normales
      keys.forEach(key => {
        updates.push(`"${key}" = $${paramIndex}`);
        updateValues.push(otherFields[key]);
        paramIndex++;
      });

      // Manejar parent_id con conversión a UUID
      if (parent_id !== undefined) {
        updates.push(`parent_id = $${paramIndex}`);
        updateValues.push(parent_id ? UUID.fromString(parent_id).getValue() : null);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);
      updateValues.push(categoryId.getValue());

      const query = `
        UPDATE public.categories
        SET ${updates.join(', ')}
        WHERE "id" = $${paramIndex}
        RETURNING *
      `;
      const result = await client.query<Category>(query, updateValues);
      if (result.rowCount === 0) throw new NotFoundException(`Category with ID ${id} not found.`)
      return result.rows[0];
    })
    return category;
  }

  async remove(id: string) {
    const categoryId = UUID.fromString(id);
    const deletedCategory = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<Category, 'id'>>('DELETE FROM public.categories WHERE id = $1 RETURNING id', [categoryId.getValue()]);
      return result.rows[0];
    })
    if (!deletedCategory) throw new NotFoundException('Category not found');
    return { message: `Category with ID: (${deletedCategory.id}) has deleted successfully!` };
  }

  private buildQuery = (filters: CategoryFilters = { is_public: 'false' }) => {
    const store = this.als.getStore();
    if (store?.institutionId && filters.is_public === 'false') {
      if (filters.parent_ids) {
        const parentIds = filters.parent_ids.split(',');
        return { query: 'SELECT * FROM public.categories JOIN public.institution_category_assignment ON public.categories.id = public.institution_category_assignment.category_id WHERE public.institution_category_assignment.institution_id = $1 AND parent_id = ANY($2::uuid[])', values: [store.institutionId, parentIds] }
      }
      return { query: 'SELECT * FROM public.categories JOIN public.institution_category_assignment ON public.categories.id = public.institution_category_assignment.category_id WHERE public.institution_category_assignment.institution_id = $1', values: [store.institutionId] }
    }

    if (filters.parent_ids) {
      const parentIds = filters.parent_ids.split(',');
      return { query: 'SELECT * FROM public.categories WHERE parent_id = ANY($1::uuid[])', values: [parentIds] }
    }
    return { query: 'SELECT * FROM public.categories', values: undefined }

  }
}
