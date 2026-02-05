import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PgService } from 'src/database/pg-config.service';
import { CreateCategoryDto } from 'src/dto/create-category.dto';
import { CategoryFilters } from 'src/dto/filters.dto';
import { UpdateCategoryDto } from 'src/dto/update-category.dto';
import { Category } from 'src/entities/category.entity';
import { UUID } from 'src/helpers/uuid';
import { CategoryModel } from 'src/models/category.model';
import { AlsStore } from 'src/modules/app.module';

@Injectable()
export class CategoryService {
  private _categoryModel: CategoryModel;

  constructor(private readonly db: PgService, private readonly als: AsyncLocalStorage<AlsStore>) {
    this._categoryModel = new CategoryModel(this.db);
  }

  async create(createCategoryDto: CreateCategoryDto) {

    const categoryId = UUID.create().getValue();
    const payload: Omit<Category, 'updated_at' | 'created_at'> = { id: categoryId, name: createCategoryDto.name };

    if (createCategoryDto.parent_id) {
      payload.parent_id = UUID.fromString(createCategoryDto.parent_id).getValue();
    }

    if(createCategoryDto.element_type) {
      payload.element_type = createCategoryDto.element_type;
    }

    if (createCategoryDto.color) {
      payload.color = createCategoryDto.color;
    }

    if (createCategoryDto.icon) {
      payload.icon = createCategoryDto.icon;
    }

    const category = await this._categoryModel.create(payload);

    const institutionCategoryAssignmentModel = this._categoryModel.getInstitutionCategoryAssignmentModel();

    if (createCategoryDto.institution_id) {
      await institutionCategoryAssignmentModel.create({ institution_id: createCategoryDto.institution_id, category_id: categoryId });
    }

    return category;
  }

  async findAll(filters: CategoryFilters = { is_public: 'false' }) {

    const store = this.als.getStore();

    const where: Record<string, any> = {};
    const options: any = { where };

    // Filtrar por institution_id usando whereRelation (relación many-to-many)
    if(store?.institutionId && filters.is_public === 'false') {
      where.institution_id = store.institutionId;
    }

    if(filters.parent_ids) {
      where.parent_id = { in: filters.parent_ids.split(',') };
    }

    const categories = await this._categoryModel.findAll(options);
    console.log('categories', categories);
    return categories;
  }

  async findOne(id: string) {
    const categoryId = UUID.fromString(id);
    const category = await this._categoryModel.findOne({ where: { id: categoryId.getValue() } });
    if (!category) throw new NotFoundException('Category not found')
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const categoryId = UUID.fromString(id);
    const payload: Partial<Category> = {};

    if (updateCategoryDto.parent_id) {
      payload.parent_id = UUID.fromString(updateCategoryDto.parent_id).getValue();
    }

    if (updateCategoryDto.element_type) {
      payload.element_type = updateCategoryDto.element_type;
    }

    if (updateCategoryDto.color) {
      payload.color = updateCategoryDto.color;
    }

    if (updateCategoryDto.icon) {
      payload.icon = updateCategoryDto.icon;
    }

    if(updateCategoryDto.name) {
      payload.name = updateCategoryDto.name;
    }

    if(Object.keys(payload).length === 0) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    const category = await this._categoryModel.update(payload, { where: { id: categoryId.getValue() } });
    if (!category) throw new NotFoundException(`Category with ID ${categoryId.getValue()} not found.`);
    return category;
  }

  async remove(id: string) {
    const categoryId = UUID.fromString(id);
    const deletedCategory = await this._categoryModel.delete({ where: { id: categoryId.getValue() } });
    if (!deletedCategory) throw new NotFoundException('Category not found');
    return { message: `Category with ID: (${deletedCategory.id}) has deleted successfully!` };
  } 
}
