import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { FilledForm } from 'src/entities/filled_form.entity';
import { FormVersion } from 'src/entities/form_version.entity';
import { Form } from 'src/entities/form.entity';
import { PgService } from 'src/database/pg-config.service';

export class FilledFormModel extends BaseModel<FilledForm> {
  private formVersionModel: Model<FormVersion>;
  private formModel: Model<Form>;

  constructor(pgService: PgService) {
    super('filled_forms', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.formVersionModel = new Model<FormVersion>('form_versions', this.pgService);
    this.formModel = new Model<Form>('forms', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    this.model.belongsTo('formVersion', this.formVersionModel, 'form_version_id');
    this.formVersionModel.belongsTo('form', this.formModel, 'form_id');
    this.formModel.hasMany('versions', this.formVersionModel, 'form_id');
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getFormVersionModel(): Model<FormVersion> {
    this.initialize(); // Asegurar que las relaciones estén inicializadas
    return this.formVersionModel;
  }

  getFormModel(): Model<Form> {
    this.initialize(); // Asegurar que las relaciones estén inicializadas
    return this.formModel;
  }
}
