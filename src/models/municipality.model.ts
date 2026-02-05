import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { Municipality } from 'src/entities/municipality.entity';
import { Parrish } from 'src/entities/parrish.entity';
import { PgService } from 'src/database/pg-config.service';

export class MunicipalityModel extends BaseModel<Municipality> {
  private parrishModel: Model<Parrish>;

  constructor(pgService: PgService) {
    super('municipalities', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.parrishModel = new Model<Parrish>('parrishes', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    // Un municipio tiene muchas parroquias
    this.model.hasMany('parrishes', this.parrishModel, 'municipality_id', 'id');
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getParrishModel(): Model<Parrish> {
    return this.parrishModel;
  }
}
