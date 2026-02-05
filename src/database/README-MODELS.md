# Sistema de Modelos Personalizados

Este sistema permite crear clases modelo personalizadas con relaciones predefinidas, similar a Sequelize o Prisma.

## Características

- ✅ **Relaciones predefinidas**: Define relaciones una vez en tu clase modelo
- ✅ **Includes con WHERE**: Filtra relaciones incluidas con condiciones
- ✅ **Includes con ORDER**: Ordena relaciones incluidas
- ✅ **Includes con LIMIT**: Limita el número de registros en relaciones incluidas
- ✅ **Sintaxis simple**: Usa strings simples o objetos con opciones

## Uso Básico

### 1. Crear una clase modelo personalizada

```typescript
import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { Form } from 'src/entities/form.entity';
import { FormVersion } from 'src/entities/form_version.entity';
import { Category } from 'src/entities/category.entity';

export class FormModel extends BaseModel<Form> {
    private formVersionModel: Model<FormVersion>;
    private categoryModel: Model<Category>;

    constructor(pgService: PgService) {
        super('forms', pgService);
        // Las relaciones se inicializan automáticamente aquí
    }

    protected initializeRelations(): void {
        // Crear modelos relacionados internamente
        this.formVersionModel = new Model<FormVersion>('form_versions', this.pgService);
        this.categoryModel = new Model<Category>('categories', this.pgService);

        // Define relaciones una vez aquí - se ejecuta automáticamente
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
```

### 2. Usar en un servicio

```typescript
@Injectable()
export class FormService {
    private formModel: FormModel;

    constructor(private readonly db: PgService) {
        // Solo crear el modelo personalizado - las relaciones se inicializan automáticamente
        this.formModel = new FormModel(db);
        // ¡No necesitas crear otros modelos ni llamar setupRelations()!
    }

    async findAll() {
        // Decides qué relaciones incluir en cada consulta
        return this.formModel.findAll({
            include: ['categories', 'versions']
        });
    }

    async findOne(id: string) {
        // Sin incluir relaciones
        return this.formModel.findByPk(id);

        // Con relaciones incluidas
        return this.formModel.findByPk(id, ['categories', 'versions']);
    }
}
```

## Includes Avanzados

### Include con WHERE

```typescript
// Obtener form con solo versiones activas
const form = await this.formModel.findByPk(formId, [
    'categories',
    {
        relation: 'versions',
        where: { is_active: true }
    }
]);
```

### Include con ORDER

```typescript
// Obtener form con versiones ordenadas por número
const form = await this.formModel.findByPk(formId, [
    {
        relation: 'versions',
        order: { version_number: 'DESC' }
    }
]);
```

### Include con LIMIT

```typescript
// Obtener form con solo la última versión
const form = await this.formModel.findByPk(formId, [
    {
        relation: 'versions',
        where: { is_active: true },
        order: { version_number: 'DESC' },
        limit: 1
    }
]);
```

### Combinación de opciones

```typescript
// Múltiples relaciones con diferentes opciones
const forms = await this.formModel.findAll({
    where: { tag: 'public' },
    include: [
        // Relación simple
        'categories',
        
        // Relación con filtros
        {
            relation: 'versions',
            where: { is_active: true },
            order: { version_number: 'DESC' },
            limit: 1
        },
        
        // Otra relación con filtros
        {
            relation: 'categories',
            where: { element_type: 'form' },
            order: { name: 'ASC' }
        }
    ],
    order: { created_at: 'DESC' },
    limit: 10
});
```

## Tipos de Relaciones

### belongsTo (Pertenece a)

```typescript
this.model.belongsTo('formVersion', formVersionModel, 'form_version_id');
```

### hasMany (Tiene muchos)

```typescript
this.model.hasMany('versions', formVersionModel, 'form_id', 'id');
```

### belongsToMany (Muchos a muchos)

```typescript
this.model.belongsToMany(
    'categories',
    categoryModel,
    'form_category_assignment', // tabla intermedia
    'form_id',                  // FK en tabla intermedia
    'category_id'              // FK en tabla intermedia
);
```

## Ventajas

1. **DRY (Don't Repeat Yourself)**: Define relaciones una vez, úsalas siempre
2. **Type Safety**: TypeScript te ayuda con autocompletado
3. **Flexibilidad**: Puedes usar includes simples o avanzados según necesites
4. **Mantenibilidad**: Cambios en relaciones se hacen en un solo lugar
5. **Legibilidad**: Código más limpio y fácil de entender

## Migración desde Model directo

### Antes (Model directo)

```typescript
constructor(private readonly db: PgService) {
    this._formModel = new Model<Form>('forms', db);
    this._formVersion = new Model<FormVersion>('form_versions', db);
    
    // Relaciones definidas cada vez
    this._formModel.hasMany('versions', this._formVersion, 'form_id', 'id');
}
```

### Después (BaseModel)

```typescript
constructor(private readonly db: PgService) {
    // Solo crear el modelo personalizado - relaciones se inicializan automáticamente
    this.formModel = new FormModel(db);
    // ¡No necesitas crear otros modelos ni llamar setupRelations()!
    // Las relaciones están definidas dentro de FormModel
}
```
