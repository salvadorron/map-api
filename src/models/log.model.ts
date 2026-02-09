import { BaseModel } from 'src/database/base-model';
import { Log } from 'src/entities/log.entity';
import { PgService } from 'src/database/pg-config.service';
import { UserModel } from 'src/models/user.model';

export class LogModel extends BaseModel<Log> {
  constructor(pgService: PgService) {
    super('logs', pgService);
  }

  protected initializeRelations(): void {
    // Relación con usuario para poder incluir datos del usuario en consultas
    const userModel = new UserModel(this.pgService);
    this.model.belongsTo('user', userModel.getModel(), 'user_id', 'id');
  }
}
