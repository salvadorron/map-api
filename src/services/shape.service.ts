import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PgService } from 'src/database/pg-config.service';
import { CreateShapeDto } from 'src/dto/create-shape.dto';
import { ShapeFilters } from 'src/dto/filters.dto';
import { UpdateShapeDto } from 'src/dto/update-shape.dto';
import { UUID } from 'src/helpers/uuid';
import { AlsStore } from 'src/modules/app.module';
import { ShapeModel } from 'src/models/shape.model';
import { UserRole } from 'src/dto/create-user.dto';
import { CategoryModel } from 'src/models/category.model';

@Injectable()
export class ShapeService {
  private shapeModel: ShapeModel;
  private categoryModel: CategoryModel;
  constructor(
    private readonly db: PgService,
    private readonly als: AsyncLocalStorage<AlsStore>
  ) {
    this.shapeModel = new ShapeModel(this.db);
    this.categoryModel = new CategoryModel(this.db);
    this.shapeModel.initialize();
    this.categoryModel.initialize();
  }

  async create({ geom, properties = {}, category_ids, institution_id }: CreateShapeDto) {
    const shapeId = UUID.create();
    let institutionIdValue = institution_id ? UUID.fromString(institution_id).getValue() : null;

    const shape = await this.shapeModel.create({
      id: shapeId.getValue(),
      properties,
      geom,
      institution_id: institutionIdValue,
      status: 'PENDING'
    });

    const shapeCategoryModel = this.shapeModel.getShapeCategoryModel();
    for (const categoryId of category_ids) {
      institutionIdValue = await this.db.runInTransaction<string | null>(async (client) => {
        const query = `
        SELECT institution_id
        FROM institution_category_assignment
        WHERE category_id = $1
        LIMIT 1
      `;
        const result = await client.query<{ institution_id: string }>(query, [categoryId]);
        return result.rows.length > 0 ? result.rows[0].institution_id : null;
      });
      await shapeCategoryModel.create({
        shape_id: shapeId.getValue(),
        category_id: categoryId
      });
    }

    
    const categories = await this.categoryModel.findAll({
      where: {
        id: {
          in: category_ids
        }
      }
    });

    return {
      type: 'Feature',
      geometry: shape.geom,
      properties: {
        ...shape.properties,
        id: shape.id,
        categories: categories,
        created_at: shape.created_at,
        updated_at: shape.updated_at
      },
    };
  }

  async findAll(filters: ShapeFilters) {
    const store = this.als.getStore();

    const options: any = {
      include: ['categories']
    };

    if (!filters.is_public && store && store.institutionId && store.role !== UserRole.SUPER_ADMIN) {
      options.institution_id = store.institutionId;
    }

    if (filters.status) {
      options.status = filters.status;
    } else if (!store?.institutionId) {
      options.status = 'APPROVED';
    }

    if (filters.municipality_ids && !filters.municipality_ids.includes('ALL')) {
      options.municipality = filters.municipality_ids;
    }

    if (filters.category_ids && !filters.category_ids.includes('ALL')) {
      const splittedCategories = filters.category_ids.split(',');
      options.whereRelation = {
        categories: {
          id: { in: splittedCategories }
        }
      };
    }



    const shapes = await this.shapeModel.findAll(options);

    return shapes.map(shape => ({
      type: 'Feature',
      geometry: shape.geom,
      properties: {
        ...shape.properties,
        status: shape.status,
        categories: (shape as any).categories || [],
        id: shape.id,
        updated_at: shape.updated_at,
        created_at: shape.created_at
      }
    }));
  }

  async findOne(id: string) {
    const shapeId = UUID.fromString(id);

    const shape = await this.shapeModel.findOne({
      where: { id: shapeId.getValue() },
      include: ['categories']
    });

    if (!shape) {
      throw new NotFoundException('Shape not found');
    }

    return {
      type: 'Feature',
      geometry: shape.geom,
      properties: {
        ...shape.properties,
        status: shape.status,
        categories: (shape as any).categories || [],
        id: shape.id,
        updated_at: shape.updated_at,
        created_at: shape.created_at
      }
    };
  }

  async update(id: string, updateShapeDto: UpdateShapeDto) {
    const shapeId = UUID.fromString(id);

    const updateData: Record<string, any> = {};

    if (updateShapeDto.status) {
      updateData.status = updateShapeDto.status;
    }

    if (updateShapeDto.geom) {
      updateData.geom = updateShapeDto.geom;
    }

    if (updateShapeDto.institution_id) {
      updateData.institution_id = UUID.fromString(updateShapeDto.institution_id).getValue();
    }

    if (updateShapeDto.properties) {
      updateData.properties = updateShapeDto.properties;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    await this.shapeModel.update(updateData, {
      where: { id: shapeId.getValue() }
    });

    if (updateShapeDto.category_ids) {
      const shapeCategoryModel = this.shapeModel.getShapeCategoryModel();

      await shapeCategoryModel.delete({
        where: { shape_id: shapeId.getValue() }
      });

      for (const categoryId of updateShapeDto.category_ids) {
        await shapeCategoryModel.create({
          shape_id: shapeId.getValue(),
          category_id: categoryId
        });
      }
    }

    const shape = await this.shapeModel.findOne({
      where: { id: shapeId.getValue() },
      include: ['categories']
    });

    if (!shape) {
      throw new NotFoundException(`Shape with ID ${id} not found.`);
    }

    return {
      type: 'Feature',
      geometry: shape.geom,
      properties: {
        ...shape.properties,
        categories: (shape as any).categories || [],
        id: shape.id,
        institution_id: shape.institution_id,
        status: shape.status,
        updated_at: shape.updated_at,
        created_at: shape.created_at
      }
    };
  }

  async remove(id: string) {
    const shapeId = UUID.fromString(id);
    const deletedShape = await this.shapeModel.delete({
      where: { id: shapeId.getValue() }
    });

    if (!deletedShape) {
      throw new NotFoundException('Shape not found');
    }

    return { message: `Shape with ID: (${deletedShape.id}) has deleted successfully!` };
  }


}