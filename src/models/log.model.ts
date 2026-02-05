import { BaseModel } from 'src/database/base-model';
import { Log } from 'src/entities/log.entity';
import { PgService } from 'src/database/pg-config.service';

export class LogModel extends BaseModel<Log> {
  constructor(pgService: PgService) {
    super('logs', pgService);
  }

  protected initializeRelations(): void {
    // Log no tiene relaciones con otras entidades
  }
}
