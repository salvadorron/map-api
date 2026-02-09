import { PgService } from './pg-config.service';
import { Model } from './model.config';

/**
 * Clase base abstracta para crear modelos personalizados con relaciones predefinidas
 * Similar a Sequelize/Prisma, permite definir relaciones una vez y reutilizarlas
 * 
 * Las relaciones se inicializan automáticamente en el constructor.
 * Cada modelo personalizado crea sus propios modelos relacionados internamente.
 * 
 * @example
 * ```typescript
 * class FormModel extends BaseModel<Form> {
 *   private formVersionModel: Model<FormVersion>;
 *   private categoryModel: Model<Category>;
 * 
 *   constructor(pgService: PgService) {
 *     super('forms', pgService);
 *     // Las relaciones se inicializan automáticamente aquí
 *   }
 * 
 *   protected initializeRelations(): void {
 *     // Crear modelos relacionados internamente
 *     this.formVersionModel = new Model<FormVersion>('form_versions', this.pgService);
 *     this.categoryModel = new Model<Category>('categories', this.pgService);
 * 
 *     // Definir relaciones
 *     this.model.hasMany('versions', this.formVersionModel, 'form_id', 'id');
 *     this.model.belongsToMany('categories', this.categoryModel, 'form_category_assignment', 'form_id', 'category_id');
 *   }
 * }
 * ```
 */
export abstract class BaseModel<T> {
    protected model: Model<T>;
    private relationsInitialized: boolean = false;

    constructor(
        tableName: string,
        protected pgService: PgService,
        primaryKey: keyof T = 'id' as any
    ) {
        this.model = new Model<T>(tableName, pgService, primaryKey);
    }

    /**
     * Método abstracto para inicializar relaciones
     * Debe ser implementado por las clases hijas
     * Se llama automáticamente la primera vez que se accede a métodos que requieren relaciones
     * Aquí puedes crear modelos relacionados y definir relaciones
     */
    protected abstract initializeRelations(): void;

    /**
     * Asegura que las relaciones estén inicializadas
     * Se llama automáticamente antes de usar métodos que requieren relaciones
     */
    private ensureRelationsInitialized(): void {
        if (!this.relationsInitialized) {
            this.initializeRelations();
            this.relationsInitialized = true;
        }
    }

    // Delegar métodos del Model para facilitar el uso
    async findByPk(id: string, include?: string[] | Array<{ relation: string; where?: any; order?: any; limit?: number }>) {
        this.ensureRelationsInitialized();
        return this.model.findByPk(id, include);
    }

    async findOne(options?: {
        where?: any;
        include?: string[] | Array<{ relation: string; where?: any; order?: any; limit?: number }>;
        order?: any;
        limit?: number;
    }) {
        this.ensureRelationsInitialized();
        return this.model.findOne(options);
    }

    async findAll(options?: {
        where?: any;
        include?: string[] | Array<{ relation: string; where?: any; order?: any; limit?: number }>;
        order?: any;
        limit?: number;
    }) {
        this.ensureRelationsInitialized();
        return this.model.findAll(options);
    }

    async create(data: any) {
        this.ensureRelationsInitialized();
        return this.model.create(data);
    }

    async update(data: any, options?: any) {
        this.ensureRelationsInitialized();
        return this.model.update(data, options);
    }

    async delete(options?: any) {
        this.ensureRelationsInitialized();
        return this.model.delete(options);
    }

    async findAndCountAll(options?: {
        where?: any;
        include?: string[] | Array<{ relation: string; where?: any; order?: any; limit?: number }>;
        order?: any;
        limit?: number;
        offset?: number;
        whereRelation?: any; // Para filtrar por relaciones (many-to-many)
    }) {
        this.ensureRelationsInitialized();
        return this.model.findAndCountAll(options);
    }

    /**
     * Acceso directo al modelo subyacente si se necesita
     */
    getModel(): Model<T> {
        this.ensureRelationsInitialized();
        return this.model;
    }

    /**
     * Método público para forzar la inicialización de relaciones
     * Útil cuando necesitas acceder a modelos relacionados antes de usar métodos del modelo
     */
    public initialize(): void {
        this.ensureRelationsInitialized();
    }
}
