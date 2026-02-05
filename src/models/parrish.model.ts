import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { Parrish } from 'src/entities/parrish.entity';
import { Municipality } from 'src/entities/municipality.entity';
import { PgService } from 'src/database/pg-config.service';

export class ParrishModel extends BaseModel<Parrish> {
  private municipalityModel: Model<Municipality>;

  constructor(pgService: PgService) {
    super('parrishes', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.municipalityModel = new Model<Municipality>('municipalities', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    // Una parroquia pertenece a un municipio
    this.model.belongsTo('municipality', this.municipalityModel, 'municipality_id', 'id');
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getMunicipalityModel(): Model<Municipality> {
    return this.municipalityModel;
  }
}
