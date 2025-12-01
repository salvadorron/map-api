import { Injectable } from '@nestjs/common';
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
      const result = await client.query<Category>('INSERT INTO public.categories (id, name, icon, color, parent_id, element_type, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [categoryId.getValue(), name, icon, color, parent_id, element_type, new Date(), new Date()]);
      const categoryDone = result.rows[0]
      return categoryDone
    })
    return category;
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: string) {
    return `This action returns a #${id} category`;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: string) {
    return `This action removes a #${id} category`;
  }
}
