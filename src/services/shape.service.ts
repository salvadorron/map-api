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

  async create({ geom, properties = {}, category_ids, institution_id, is_public = false }: CreateShapeDto) {
    const shapeId = UUID.create()
    const shape = await this.db.runInTransaction(async (client) => {
      const institutionIdValue = institution_id ? UUID.fromString(institution_id).getValue() : null;
      const insertResult = await client.query<Shape>(
        'INSERT INTO shapes (id, properties, geom, institution_id, is_public, created_at, updated_at) VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5, $6, $7) RETURNING created_at, updated_at',
        [shapeId.getValue(), properties, geom, institutionIdValue, is_public, new Date(), new Date()]
      );
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
          institution_id,
          is_public,
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
        institution_id,
        is_public,
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
    const { category_ids, geom, institution_id, ...otherFields } = updateShapeDto;
    const keys = Object.keys(otherFields);
    const values: any[] = [];

    // Construir valores para campos directos
    keys.forEach(key => {
      values.push(otherFields[key]);
    });

    if (keys.length === 0 && !category_ids && !geom && institution_id === undefined && updateShapeDto.is_public === undefined) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    const shape = await this.db.runInTransaction(async (client) => {
      // Actualizar campos directos del shape
      if (keys.length > 0 || geom || institution_id !== undefined || updateShapeDto.is_public !== undefined) {
        const updates: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        // Manejar campos normales
        keys.forEach(key => {
          updates.push(`"${key}" = $${paramIndex}`);
          updateValues.push(otherFields[key]);
          paramIndex++;
        });

        // Manejar geom si se proporciona
        if (geom) {
          updates.push(`geom = ST_GeomFromGeoJSON($${paramIndex})`);
          updateValues.push(geom);
          paramIndex++;
        }

        // Manejar institution_id
        if (institution_id !== undefined) {
          updates.push(`institution_id = $${paramIndex}`);
          updateValues.push(institution_id ? UUID.fromString(institution_id).getValue() : null);
          paramIndex++;
        }

        // Manejar is_public
        if (updateShapeDto.is_public !== undefined) {
          updates.push(`is_public = $${paramIndex}`);
          updateValues.push(updateShapeDto.is_public);
          paramIndex++;
        }

        updates.push(`updated_at = NOW()`);
        updateValues.push(shapeId.getValue());

        const query = `
          UPDATE shapes
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING id, properties, ST_AsGeoJSON(geom)::json as geom, institution_id, is_public, created_at, updated_at
        `;
        await client.query<Shape>(query, updateValues);
      }

      // Actualizar relaciones con categorías si se proporciona category_ids
      if (category_ids !== undefined) {
        // Eliminar relaciones existentes
        await client.query(
          'DELETE FROM shapes_categories WHERE shape_id = $1',
          [shapeId.getValue()]
        );

        // Insertar nuevas relaciones
        for (const categoryId of category_ids) {
          await client.query(
            'INSERT INTO shapes_categories (shape_id, category_id) VALUES($1,$2)',
            [shapeId.getValue(), categoryId]
          );
        }
      }

      // Retornar el shape actualizado con sus categorías
      const shapeResult = await client.query<Shape>(`
        SELECT id, properties, ST_AsGeoJSON(geom)::json as geom, institution_id, is_public, created_at, updated_at
        FROM shapes WHERE id = $1
      `, [shapeId.getValue()]);

      if (shapeResult.rowCount === 0) throw new NotFoundException(`Shape with ID ${id} not found.`);

      const shapeData = shapeResult.rows[0];
      const relatedCategories = await client.query<Category>(`
        SELECT * FROM public.categories as c
        JOIN shapes_categories as sc on c.id = sc.category_id
        WHERE sc.shape_id = $1
      `, [shapeId.getValue()]);

      return {
        type: 'Feature',
        geometry: shapeData.geom,
        properties: {
          ...shapeData.properties,
          categories: relatedCategories.rows,
          id: shapeData.id,
          institution_id: shapeData.institution_id,
          is_public: shapeData.is_public,
          updated_at: shapeData.updated_at,
          created_at: shapeData.created_at
        }
      };
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
