/**
 * EJEMPLO DE USO DE RELACIONES EN MODEL
 * 
 * Este archivo muestra cómo usar las relaciones en el Model.
 * NO es código de producción, solo ejemplos.
 */

import { Model } from './model.config';
import { PgService } from './pg-config.service';
import { Category } from '../entities/category.entity';
import { Form } from '../entities/form.entity';
import { FormVersion } from '../entities/form_version.entity';
import { FilledForm } from '../entities/filled_form.entity';
import { Shape } from '../entities/shape.entity';

// ============================================
// EJEMPLO 1: Relación belongsTo (pertenece a)
// ============================================

// Un FilledForm pertenece a un FormVersion
function setupFilledFormRelations(filledFormModel: Model<FilledForm>, formVersionModel: Model<FormVersion>) {
  filledFormModel.belongsTo('formVersion', formVersionModel, 'form_version_id', 'id');
  
  // Uso:
  // const filledForm = await filledFormModel.findOne({
  //   where: { id: 'some-id' },
  //   include: ['formVersion'] // Carga automáticamente el formVersion relacionado
  // });
  // console.log(filledForm.formVersion); // Objeto FormVersion completo
}

// ============================================
// EJEMPLO 2: Relación hasMany (tiene muchos)
// ============================================

// Un Form tiene muchos FormVersions
function setupFormRelations(formModel: Model<Form>, formVersionModel: Model<FormVersion>) {
  formModel.hasMany('versions', formVersionModel, 'form_id', 'id');
  
  // Uso:
  // const form = await formModel.findOne({
  //   where: { id: 'some-id' },
  //   include: ['versions'] // Carga automáticamente todos los FormVersions
  // });
  // console.log(form.versions); // Array de FormVersions
}

// ============================================
// EJEMPLO 3: Relación belongsToMany (muchos a muchos)
// ============================================

// Un Shape tiene muchas Categories a través de shapes_categories
function setupShapeRelations(shapeModel: Model<Shape>, categoryModel: Model<Category>) {
  shapeModel.belongsToMany(
    'categories',           // nombre de la relación
    categoryModel,          // modelo relacionado
    'shapes_categories',    // tabla intermedia
    'shape_id',             // foreignKey en tabla intermedia (apunta a shapes)
    'category_id',           // otherKey en tabla intermedia (apunta a categories)
    'id',                    // localKey en shapes (por defecto 'id')
    'id'                     // otherLocalKey en categories (por defecto 'id')
  );
  
  // Uso:
  // const shape = await shapeModel.findOne({
  //   where: { id: 'some-id' },
  //   include: ['categories'] // Carga automáticamente todas las Categories relacionadas
  // });
  // console.log(shape.categories); // Array de Categories
}

// ============================================
// EJEMPLO 4: Relación anidada (parent-child)
// ============================================

// Una Category puede tener un parent (otra Category)
function setupCategoryRelations(categoryModel: Model<Category>) {
  categoryModel.belongsTo('parent', categoryModel, 'parent_id', 'id');
  categoryModel.hasMany('children', categoryModel, 'parent_id', 'id');
  
  // Uso:
  // const category = await categoryModel.findOne({
  //   where: { id: 'some-id' },
  //   include: ['parent', 'children'] // Carga parent y children
  // });
  // console.log(category.parent);    // Category padre
  // console.log(category.children); // Array de Categories hijas
}

// ============================================
// EJEMPLO COMPLETO: Uso en un Service
// ============================================

export class ExampleService {
  private filledFormModel: Model<FilledForm>;
  private formVersionModel: Model<FormVersion>;
  private formModel: Model<Form>;
  private shapeModel: Model<Shape>;
  private categoryModel: Model<Category>;

  constructor(private db: PgService) {
    // Crear modelos
    this.filledFormModel = new Model<FilledForm>('filled_forms', db);
    this.formVersionModel = new Model<FormVersion>('form_versions', db);
    this.formModel = new Model<Form>('forms', db);
    this.shapeModel = new Model<Shape>('shapes', db);
    this.categoryModel = new Model<Category>('categories', db);

    // Configurar relaciones
    this.setupRelations();
  }

  private setupRelations() {
    // FilledForm -> FormVersion (belongsTo)
    this.filledFormModel.belongsTo('formVersion', this.formVersionModel, 'form_version_id');
    
    // FormVersion -> Form (belongsTo)
    this.formVersionModel.belongsTo('form', this.formModel, 'form_id');
    
    // Form -> FormVersions (hasMany)
    this.formModel.hasMany('versions', this.formVersionModel, 'form_id');
    
    // Shape -> Categories (belongsToMany)
    this.shapeModel.belongsToMany(
      'categories',
      this.categoryModel,
      'shapes_categories',
      'shape_id',
      'category_id'
    );
    
    // Category -> Parent (belongsTo)
    this.categoryModel.belongsTo('parent', this.categoryModel, 'parent_id');
    
    // Category -> Children (hasMany)
    this.categoryModel.hasMany('children', this.categoryModel, 'parent_id');
  }

  // Ejemplo: Obtener un filled form con su formVersion y form
  async getFilledFormWithRelations(id: string) {
    const filledForm = await this.filledFormModel.findOne({
      where: { id },
      include: ['formVersion'] // Carga formVersion
    });

    if (!filledForm) return null;

    // Cargar el form del formVersion
    const formVersion = await this.formVersionModel.findOne({
      where: { id: filledForm.form_version_id },
      include: ['form'] // Carga el form relacionado
    });

    return {
      ...filledForm,
      formVersion: {
        form_version_id: filledForm.form_version_id,
        form: formVersion?.form_id
      }
    };
  }

  // Ejemplo: Obtener un shape con sus categories
  async getShapeWithCategories(id: string) {
    return await this.shapeModel.findOne({
      where: { id },
      include: ['categories'] // Carga todas las categories relacionadas
    });
  }

  // Ejemplo: Obtener todas las categories con sus parents y children
  async getCategoriesWithRelations() {
    return await this.categoryModel.findAll({
      include: ['parent', 'children']
    });
  }
}
