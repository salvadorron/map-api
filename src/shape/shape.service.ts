import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShapeDto } from './dto/create-shape.dto';
import { UpdateShapeDto } from './dto/update-shape.dto';
import { PgService } from 'src/database/pg-config.service';
import { Shape } from './entities/shape.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class ShapeService {

  constructor(private readonly db: PgService) { }

  async create(createShapeDto: CreateShapeDto) {
    const { properties = {}, geom } = createShapeDto;
    const shapeId = UUID.create()
    const shape = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Shape>('INSERT INTO shapes (id, properties, geom, created_at, updated_at) VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4, $5) RETURNING *', [shapeId.getValue(), properties, geom, new Date(), new Date()])
      return result.rows[0];
    })
    return shape;
  }

  async findAll() {
    const shapes = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Shape>('SELECT * FROM shapes');
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


    if(keys.length === 0 || values.length === 0) throw new BadRequestException('Must be at least one property to patch')

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
      if(result.rowCount === 0) throw new NotFoundException(`Shape with ID ${id} not found.`)
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
