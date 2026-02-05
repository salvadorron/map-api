import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { Form } from 'src/entities/form.entity';
import { FormVersion } from 'src/entities/form_version.entity';
import { Category } from 'src/entities/category.entity';
import { FormCategoryAssignament } from 'src/entities/form_category_assignament';
import { PgService } from 'src/database/pg-config.service';

export class FormModel extends BaseModel<Form> {
  private formVersionModel: Model<FormVersion>;
  private categoryModel: Model<Category>;
  private formCategoryAssignamentModel: Model<FormCategoryAssignament>;

  constructor(pgService: PgService) {
    super('forms', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.formVersionModel = new Model<FormVersion>('form_versions', this.pgService);
    this.categoryModel = new Model<Category>('categories', this.pgService);
    this.formCategoryAssignamentModel = new Model<FormCategoryAssignament>('form_category_assignment', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    this.model.hasMany('versions', this.formVersionModel, 'form_id', 'id');
    this.model.belongsToMany(
      'categories',
      this.categoryModel,
      'form_category_assignment',
      'form_id',
      'category_id'
    );
    this.formVersionModel.belongsTo('form', this.model, 'form_id', 'id');
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getFormVersionModel(): Model<FormVersion> {
    this.initialize(); // Asegurar que las relaciones estén inicializadas
    return this.formVersionModel;
  }

  getCategoryModel(): Model<Category> {
    this.initialize(); // Asegurar que las relaciones estén inicializadas
    return this.categoryModel;
  }

  getFormCategoryAssignamentModel(): Model<FormCategoryAssignament> {
    this.initialize(); // Asegurar que las relaciones estén inicializadas
    return this.formCategoryAssignamentModel;
  }
}
