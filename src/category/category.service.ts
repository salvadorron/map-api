import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PgService } from 'src/database/pg-config.service';
import { UUID } from 'src/helpers/uuid';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(readonly db: PgService) { }
  async create(createCategoryDto: CreateCategoryDto) {
    const { name, color = null, element_type = null, icon = null, parent_id = null } = createCategoryDto;
    const categoryId = UUID.create();
    const category = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Category>('INSERT INTO public.categories (id, name, icon, color, parent_id, element_type, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [categoryId.getValue(), name, icon, color, parent_id, element_type, new Date(), new Date()]);
      const categoryDone = result.rows[0]
      return categoryDone
    })
    return category;
  }

  async findAll() {
    const categories = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Category>('SELECT * FROM public.categories');
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
    const keys = Object.keys(updateCategoryDto);
    const values = Object.values(updateCategoryDto);

    if(keys.length === 0 || values.length === 0) throw new BadRequestException('Must be at least one property to patch')

    const setString = keys.map((key, index) => {
      return `"${key}" = $${index + 1}`;
    }).join(', ');

    values.push(new Date());
    values.push(categoryId.getValue())

    const category = await this.db.runInTransaction(async (client) => {
      const query = `
        UPDATE public.categories
        SET ${setString}, updated_at = $${values.length - 1}
        WHERE "id" = $${values.length}
        RETURNING *
      `;
      const result = await client.query<Category>(query, values);
      if(result.rowCount === 0) throw new NotFoundException(`Category with ID ${id} not found.`)
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
}
