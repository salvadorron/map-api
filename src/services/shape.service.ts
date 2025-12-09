import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateShapeDto } from 'src/dto/create-shape.dto';
import { UpdateShapeDto } from 'src/dto/update-shape.dto';
import { Category } from 'src/entities/category.entity';
import { Shape } from 'src/entities/shape.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class ShapeService {

  constructor(private readonly db: PgService) { }

  async create({ geom, properties = {}, category_ids }: CreateShapeDto) {
    const shapeId = UUID.create()
    const shape = await this.db.runInTransaction(async (client) => {
      const insertResult = await client.query<Shape>('INSERT INTO shapes (id, properties, geom, created_at, updated_at) VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5) RETURNING created_at, updated_at', [shapeId.getValue(), properties, geom, new Date(), new Date()])
      const { created_at, updated_at } = insertResult.rows[0];

      for await (const categoryId of category_ids) {
        await client.query<Category>('INSERT INTO shapes_categories (shape_id, category_id) VALUES($1,$2)', [shapeId.getValue(), categoryId]);
      }

      const relatedCategories = await client.query<Category>(`
        SELECT * FROM public.categories as c
        JOIN shapes_categories as sc on c.id = sc.category_id
        WHERE sc.shape_id = $1  
      `, [shapeId.getValue()]);

      return {
        type: 'Feature',
        geometry: geom,
        properties: {
          ...properties,
          id: shapeId.getValue(),
          categories: relatedCategories.rows,
          created_at,
          updated_at
        },
      }

    })
    return shape;
  }

  async findAll() {
    const shapes = await this.db.runInTransaction(async (client) => {
      const queryResult = await this.db.runInTransaction(async (client) => {
        const shapes = await client.query<Shape>(`
          SELECT
          id,
          properties, 
          ST_AsGeoJSON(geom)::json as geom, 
          created_at, 
          updated_at FROM shapes`
        );

        return await Promise.all(shapes.rows.map(async shape => {
          const relatedCategories = await client.query<Category>(`
            SELECT * FROM public.categories as c
            JOIN shapes_categories as sc on c.id = sc.category_id
            WHERE sc.shape_id = $1  
          `, [shape.id]);

          return {
            type: 'Feature',
            geometry: shape.geom,
            properties: {
              ...shape.properties,
              categories: relatedCategories.rows,
              id: shape.id,
              updated_at: shape.updated_at,
              created_at: shape.created_at
            }
          }

        }))


      });
      return queryResult
    })
    return shapes
  }

  async findOne(id: string) {
    const shapeId = UUID.fromString(id);
    const queryResult = await this.db.runInTransaction(async (client) => {

      const shape = await client.query<Shape>(`
        SELECT
        id,
        properties, 
        ST_AsGeoJSON(geom)::json as geom, 
        created_at, 
        updated_at FROM shapes WHERE id = $1`, [shapeId.getValue()]
      );

      const relatedCategories = await client.query<Category>(`
        SELECT * FROM public.categories as c
        JOIN shapes_categories as sc on c.id = sc.category_id
        WHERE sc.shape_id = $1  
      `, [shapeId.getValue()])


      if (shape.rowCount === 0) throw new NotFoundException('Shape not found')

      const shapeResult = shape.rows[0];
      const relatedCategoriesResult = relatedCategories.rows;

      return {
        type: 'Feature',
        geometry: shapeResult.geom,
        properties: {
          ...shapeResult.properties,
          categories: relatedCategoriesResult,
          id,
          updated_at: shapeResult.updated_at,
          created_at: shapeResult.created_at
        }
      }
    });
    return queryResult
  }

  async update(id: string, updateShapeDto: UpdateShapeDto) {
    const shapeId = UUID.fromString(id);
    const keys = Object.keys(updateShapeDto);
    const values = Object.values(updateShapeDto);


    if (keys.length === 0 || values.length === 0) throw new BadRequestException('Must be at least one property to patch')

    const setString = keys.map((key, index) => {
      return `"${key}" = $${index + 1}`;
    }).join(', ');

    values.push(new Date());
    values.push(shapeId.getValue())

    const shape = await this.db.runInTransaction(async (client) => {
      const query = `
        UPDATE shapes
        SET ${setString}, updated_at = $${values.length - 1}
        WHERE "id" = $${values.length}
        RETURNING *
      `;
      const result = await client.query<Shape>(query, values);
      if (result.rowCount === 0) throw new NotFoundException(`Shape with ID ${id} not found.`)
      return result.rows[0];
    })
    return shape;

  }

  async remove(id: string) {
    const shapeId = UUID.fromString(id);
    const deletedShape = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<Shape, 'id'>>('DELETE FROM shapes WHERE id = $1 RETURNING id', [shapeId.getValue()]);
      return result.rows[0];
    })

    if (!deletedShape) throw new NotFoundException('Shape not found');

    return { message: `Shape with ID: (${deletedShape.id}) has deleted successfully!` };
  }
}
