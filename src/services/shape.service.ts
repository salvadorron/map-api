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

  async create({ geom, properties = {}, category_id }: CreateShapeDto) {
    const shapeId = UUID.create()
    const shape = await this.db.runInTransaction(async (client) => {
      await client.query<Shape>('INSERT INTO shapes (id, properties, geom, created_at, updated_at) VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5) RETURNING created_at, updated_at', [shapeId.getValue(), properties, geom, new Date(), new Date()])
      await client.query<Category>('INSERT INTO shapes_categories (shape_id, category_id) VALUES($1,$2)', [shapeId.getValue(), category_id]);
      const result = await client.query<Pick<Category, 'name' | 'color' | 'icon' | 'parent_id' | 'element_type'> & Pick<Shape, 'created_at' | 'updated_at'>>(`
        SELECT 
        c.name, 
        c.color, 
        c.icon, 
        c.parent_id, 
        c.element_type,
        s.created_at, 
        s.updated_at
        from shapes as s
        JOIN public.shapes_categories as sc on sc.shape_id = s.id
        JOIN public.categories as c on sc.category_id = c.id
        `)

      const { name, color, icon, parent_id, element_type, created_at, updated_at } = result.rows[0];

      return {
        type: 'Feature',
        geometry: geom,
        properties: {
          ...properties,
          id: shapeId.getValue(),
          category_id,
          category_name: name,
          color,
          icon,
          parent_id,
          element_type,
          created_at,
          updated_at
        },
      }

    })
    return shape;
  }

  async findAll() {
    const shapes = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Shape>('SELECT id, properties, ST_AsGeoJSON(geom)::json as geom, created_at, updated_at FROM shapes');
      return result.rows;
    })
    return shapes
  }

  async findOne(id: string) {
    const shapeId = UUID.fromString(id);
    const shape = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Shape>('SELECT * FROM shapes WHERE id = $1', [shapeId.getValue()]);
      return result.rows[0];
    })
    if (!shape) throw new NotFoundException('Shape not found')
    return shape;
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
