import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { User } from 'src/entities/user.entity';
import { Institution } from 'src/entities/institution.entity';
import { PgService } from 'src/database/pg-config.service';

export class UserModel extends BaseModel<User> {
  private institutionModel: Model<Institution>;

  constructor(pgService: PgService) {
    super('users', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.institutionModel = new Model<Institution>('institutions', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    // Un usuario pertenece a una institución
    this.model.belongsTo('institution', this.institutionModel, 'institution_id', 'id');
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getInstitutionModel(): Model<Institution> {
    return this.institutionModel;
  }
}
