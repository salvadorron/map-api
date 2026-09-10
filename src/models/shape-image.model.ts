import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { ShapeImage } from 'src/entities/shape-image.entity';
import { Shape } from 'src/entities/shape.entity';
import { PgService } from 'src/database/pg-config.service';

export class ShapeImageModel extends BaseModel<ShapeImage> {
  private shapeModel: Model<Shape>;

  constructor(pgService: PgService) {
    super('shape_images', pgService);
  }

  protected initializeRelations(): void {
    this.shapeModel = new Model<Shape>('shapes', this.pgService);
    this.model.belongsTo('shape', this.shapeModel, 'shape_id');
  }

  // Exponer el modelo relacionado si se necesita en el servicio
  getShapeModel(): Model<Shape> {
    this.initialize();
    return this.shapeModel;
  }
}
