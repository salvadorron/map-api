/**
 * EJEMPLO DE USO: Cómo crear modelos personalizados con relaciones predefinidas
 * 
 * Este archivo muestra cómo usar BaseModel para crear clases modelo personalizadas
 * similares a Sequelize/Prisma
 */

import { PgService } from './pg-config.service';
import { BaseModel } from './base-model';
import { Model } from './model.config';
import { Form } from 'src/entities/form.entity';
import { FormVersion } from 'src/entities/form_version.entity';
import { Category } from 'src/entities/category.entity';
import { FilledForm } from 'src/entities/filled_form.entity';

/**
 * Ejemplo 1: Modelo de Form con relaciones predefinidas
 * Las relaciones se inicializan automáticamente en el constructor
 */
export class FormModel extends BaseModel<Form> {
    private formVersionModel: Model<FormVersion>;
    private categoryModel: Model<Category>;

    constructor(pgService: PgService) {
        super('forms', pgService);
    }

    protected initializeRelations(): void {
        // Crear modelos relacionados internamente
        this.formVersionModel = new Model<FormVersion>('form_versions', this.pgService);
        this.categoryModel = new Model<Category>('categories', this.pgService);

        // Definir relaciones - se ejecuta automáticamente
        this.model.hasMany('versions', this.formVersionModel, 'form_id', 'id');
        this.model.belongsToMany(
            'categories',
            this.categoryModel,
            'form_category_assignment',
            'form_id',
            'category_id'
        );
    }
}

/**
 * Ejemplo 2: Modelo de FormVersion con relaciones
 * Las relaciones se inicializan automáticamente en el constructor
 */
export class FormVersionModel extends BaseModel<FormVersion> {
    private formModel: Model<Form>;

    constructor(pgService: PgService) {
        // Las relaciones se inicializan automáticamente aquí
        super('form_versions', pgService);
    }

    protected initializeRelations(): void {
        // Crear modelo relacionado internamente
        this.formModel = new Model<Form>('forms', this.pgService);

        // Definir relación - se ejecuta automáticamente
        this.model.belongsTo('form', this.formModel, 'form_id', 'id');
    }
}

/**
 * Ejemplo 3: Modelo de FilledForm con relaciones
 * Las relaciones se inicializan automáticamente en el constructor
 */
export class FilledFormModel extends BaseModel<FilledForm> {
    private formVersionModel: Model<FormVersion>;
    private formModel: Model<Form>;

    constructor(pgService: PgService) {
        // Las relaciones se inicializan automáticamente aquí
        super('filled_forms', pgService);
    }

    protected initializeRelations(): void {
        // Crear modelos relacionados internamente
        this.formVersionModel = new Model<FormVersion>('form_versions', this.pgService);
        this.formModel = new Model<Form>('forms', this.pgService);

        // Definir relaciones - se ejecuta automáticamente
        this.model.belongsTo('formVersion', this.formVersionModel, 'form_version_id');
        
        // También puedes definir relaciones inversas si es necesario
        this.formVersionModel.belongsTo('form', this.formModel, 'form_id');
    }
}

/**
 * Ejemplo de uso en un servicio:
 * 
 * ```typescript
 * @Injectable()
 * export class FormService {
 *   private formModel: FormModel;
 * 
 *   constructor(private readonly db: PgService) {
 *     // Solo crear el modelo personalizado - las relaciones se inicializan automáticamente
 *     this.formModel = new FormModel(db);
 *   }
 * 
 *   async findAll() {
 *     // Usar con includes simples - decides qué relaciones incluir
 *     return this.formModel.findAll({
 *       include: ['categories', 'versions']
 *     });
 * 
 *     // O con includes con where, order y limit
 *     return this.formModel.findAll({
 *       include: [
 *         'categories',
 *         {
 *           relation: 'versions',
 *           where: { is_active: true },
 *           order: { version_number: 'DESC' },
 *           limit: 1
 *         }
 *       ]
 *     });
 *   }
 * 
 *   async findOne(id: string) {
 *     // Sin incluir relaciones
 *     return this.formModel.findByPk(id);
 * 
 *     // Con relaciones incluidas
 *     return this.formModel.findByPk(id, ['categories', 'versions']);
 *   }
 * }
 * ```
 */
