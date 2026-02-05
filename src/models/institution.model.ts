import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { Institution } from 'src/entities/institution.entity';
import { User } from 'src/entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { PgService } from 'src/database/pg-config.service';

type InstitutionCategoryAssignment = {
  institution_id: string;
  category_id: string;
};

export class InstitutionModel extends BaseModel<Institution> {
  private userModel: Model<User>;
  private categoryModel: Model<Category>;
  private institutionCategoryAssignmentModel: Model<InstitutionCategoryAssignment>;

  constructor(pgService: PgService) {
    super('institutions', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.userModel = new Model<User>('users', this.pgService);
    this.categoryModel = new Model<Category>('categories', this.pgService);
    this.institutionCategoryAssignmentModel = new Model<InstitutionCategoryAssignment>('institution_category_assignment', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    // Una institución tiene muchos usuarios
    this.model.hasMany('users', this.userModel, 'institution_id', 'id');
    // Relación many-to-many con categorías
    this.model.belongsToMany(
      'categories',
      this.categoryModel,
      'institution_category_assignment',
      'institution_id',
      'category_id'
    );
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getUserModel(): Model<User> {
    return this.userModel;
  }

  getCategoryModel(): Model<Category> {
    return this.categoryModel;
  }

  getInstitutionCategoryAssignmentModel(): Model<InstitutionCategoryAssignment> {
    return this.institutionCategoryAssignmentModel;
  }
}
