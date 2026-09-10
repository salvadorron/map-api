import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { ShapeImageDto } from 'src/dto/replace-shape-images.dto';
import { ShapeImage } from 'src/entities/shape-image.entity';
import { UUID } from 'src/helpers/uuid';
import { ShapeImageModel } from 'src/models/shape-image.model';
import { ShapeModel } from 'src/models/shape.model';

@Injectable()
export class ShapeImageService {
  private shapeImageModel: ShapeImageModel;
  private shapeModel: ShapeModel;

  constructor(private readonly db: PgService) {
    this.shapeImageModel = new ShapeImageModel(this.db);
    this.shapeModel = new ShapeModel(this.db);
    this.shapeImageModel.initialize();
    this.shapeModel.initialize();
  }

  async getByShape(shapeId: string) {
    const shapeIdValue = UUID.fromString(shapeId).getValue();
    await this.ensureShapeExists(shapeIdValue);

    return this.shapeImageModel.findAll({
      where: { shape_id: shapeIdValue },
      order: { position: 'ASC' },
    });
  }

  async replace(shapeId: string, images: ShapeImageDto[]) {
    const shapeIdValue = UUID.fromString(shapeId).getValue();

    return this.db.runInTransaction<ShapeImage[]>(async (client) => {
      const shapeResult = await client.query<{ id: string }>(
        'SELECT id FROM shapes WHERE id = $1',
        [shapeIdValue],
      );
      if (shapeResult.rows.length === 0) {
        throw new NotFoundException('Shape not found');
      }

      await client.query('DELETE FROM shape_images WHERE shape_id = $1', [
        shapeIdValue,
      ]);

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await client.query(
          `INSERT INTO shape_images (id, shape_id, url, name, size, position)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            UUID.create().getValue(),
            shapeIdValue,
            image.url,
            image.name ?? null,
            image.size ?? null,
            i,
          ],
        );
      }

      const listResult = await client.query<ShapeImage>(
        'SELECT id, shape_id, url, name, size, position, created_at FROM shape_images WHERE shape_id = $1 ORDER BY position ASC',
        [shapeIdValue],
      );
      return listResult.rows;
    });
  }

  private async ensureShapeExists(shapeId: string) {
    const shape = await this.shapeModel.findOne({ where: { id: shapeId } });
    if (!shape) {
      throw new NotFoundException('Shape not found');
    }
  }
}
