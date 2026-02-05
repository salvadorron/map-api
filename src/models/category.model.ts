import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { Category } from 'src/entities/category.entity';
import { Institution } from 'src/entities/institution.entity';
import { PgService } from 'src/database/pg-config.service';

type InstitutionCategoryAssignment = {
  institution_id: string;
  category_id: string;
};

export class CategoryModel extends BaseModel<Category> {
  private institutionModel: Model<Institution>;
  private institutionCategoryAssignmentModel: Model<InstitutionCategoryAssignment>;

  constructor(pgService: PgService) {
    super('categories', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.institutionModel = new Model<Institution>('institutions', this.pgService);
    this.institutionCategoryAssignmentModel = new Model<InstitutionCategoryAssignment>('institution_category_assignment', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    // Auto-referencia: categoría puede tener una categoría padre
    this.model.belongsTo('parent', this.model, 'parent_id', 'id');
    // Una categoría puede tener muchas subcategorías
    this.model.hasMany('children', this.model, 'parent_id', 'id');
    // Relación many-to-many con instituciones
    this.model.belongsToMany(
      'institutions',
      this.institutionModel,
      'institution_category_assignment',
      'category_id',
      'institution_id'
    );
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getInstitutionModel(): Model<Institution> {
    return this.institutionModel;
  }

  getInstitutionCategoryAssignmentModel(): Model<InstitutionCategoryAssignment> {
    return this.institutionCategoryAssignmentModel;
  }
}
