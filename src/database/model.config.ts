import { PgService } from "./pg-config.service";

export type WhereValue<V> = V | { in?: V[] } | { like?: string };

// Tipos para relaciones
type RelationType = 'belongsTo' | 'hasMany' | 'belongsToMany';

interface BelongsToRelation {
    type: 'belongsTo';
    model: Model<any>;
    foreignKey: string;
    localKey?: string;
}

interface HasManyRelation {
    type: 'hasMany';
    model: Model<any>;
    foreignKey: string;
    localKey?: string;
}

interface BelongsToManyRelation {
    type: 'belongsToMany';
    model: Model<any>;
    through: string; // tabla intermedia
    foreignKey: string; // clave foránea en tabla intermedia que apunta a este modelo
    otherKey: string; // clave foránea en tabla intermedia que apunta al modelo relacionado
    localKey?: string;
    otherLocalKey?: string;
}

type Relation = BelongsToRelation | HasManyRelation | BelongsToManyRelation;

// Tipo para incluir relaciones con opciones
type IncludeOption<R = any> = {
    where?: {
        [K in keyof R]?: WhereValue<R[K]>;
    };
    order?: {
        [K in keyof R]?: 'ASC' | 'DESC';
    };
    limit?: number;
};

type IncludeConfig = string | { relation: string; where?: any; order?: any; limit?: number };

interface QueryOptions<T> {
    where?: {
        [K in keyof T]?: WhereValue<T[K]>;
    };
    limit?: number;
    include?: IncludeConfig[]; // nombres de relaciones o objetos con opciones
    order?: {
        [K in keyof T]?: 'ASC' | 'DESC';
    };
    // Filtros basados en relaciones - permite filtrar el modelo principal basado en condiciones en relaciones
    whereRelation?: {
        [relationName: string]: {
            [key: string]: WhereValue<any>;
        };
    };
}



export class Model<T> {
    private relations: Map<string, Relation> = new Map();

    constructor(public tableName: string, private _pgService: PgService, public primaryKey: keyof T = 'id' as any) { }

    /**
     * Define una relación belongsTo (pertenece a)
     */
    belongsTo<R>(name: string, model: Model<R>, foreignKey: string, localKey: string = 'id'): this {
        this.relations.set(name, {
            type: 'belongsTo',
            model,
            foreignKey,
            localKey
        });
        return this;
    }

    /**
     * Define una relación hasMany (tiene muchos)
     */
    hasMany<R>(name: string, model: Model<R>, foreignKey: string, localKey: string = 'id'): this {
        this.relations.set(name, {
            type: 'hasMany',
            model,
            foreignKey,
            localKey
        });
        return this;
    }

    /**
     * Define una relación belongsToMany (muchos a muchos)
     */
    belongsToMany<R>(
        name: string,
        model: Model<R>,
        through: string,
        foreignKey: string,
        otherKey: string,
        localKey: string = 'id',
        otherLocalKey: string = 'id'
    ): this {
        this.relations.set(name, {
            type: 'belongsToMany',
            model,
            through,
            foreignKey,
            otherKey,
            localKey,
            otherLocalKey
        });
        return this;
    }

    async findByPk(id: string, include: IncludeConfig[] = []) {
        const query = `SELECT * FROM ${this.tableName} WHERE ${String(this.primaryKey)} = $1`;
        
        const res = await this._pgService.runInTransaction<T[]>(async (client) => {
            const result = await client.query(query, [id]);
            const rows = result.rows;

            // Cargar relaciones si se especificaron
            if (include.length > 0 && rows.length > 0) {
                return await this.loadRelations(rows, include, client);
            }

            return rows;
        });

        return res[0] || null;
    }

    async findOne(options: QueryOptions<T> = {}) {
        const { where = {}, include = [], order } = options;
        const { clause, values } = this.buildWhereClause(where);
        const orderClause = this.buildOrderClause(order);

        let query = `SELECT * FROM ${this.tableName}${clause}${orderClause} LIMIT 1`;

        const res = await this._pgService.runInTransaction<T[]>(async (client) => {
            const result = await client.query(query, values);
            const rows = result.rows;

            // Cargar relaciones si se especificaron
            if (include.length > 0 && rows.length > 0) {
                const loaded = await this.loadRelations(rows, include, client);
                return loaded;
            }

            return rows;
        });

        return res[0] || null;
    }


    async findAll(options: QueryOptions<T> = {}) {
        const { where = {}, include = [], order, limit, whereRelation } = options;

        // Procesar filtros basados en relaciones primero
        let filteredWhere = { ...where };
        if (whereRelation && Object.keys(whereRelation).length > 0) {
            const relationFilteredIds = await this._pgService.runInTransaction<string[]>(async (client) => {
                const allFilteredIds: string[][] = [];

                // Procesar cada relación en whereRelation
                for (const [relationName, relationWhere] of Object.entries(whereRelation)) {
                    const relation = this.relations.get(relationName);
                    if (!relation) {
                        console.warn(`Relation "${relationName}" not found for filtering in model ${this.tableName}`);
                        continue;
                    }

                    let relationFilteredIds: string[] = [];

                    if (relation.type === 'belongsToMany') {
                        // Para belongsToMany, primero obtener los IDs del modelo relacionado que cumplen la condición
                        const { clause: relationClause, values: relationValues } = this.buildWhereClause(relationWhere, 1);
                        const relatedQuery = `
                            SELECT ${relation.otherLocalKey || 'id'}
                            FROM ${relation.model.tableName}
                            ${relationClause}
                        `;
                        const relatedResult = await client.query<{ [key: string]: string }>(
                            relatedQuery,
                            relationValues
                        );
                        const relatedIds = relatedResult.rows.map(row => row[relation.otherLocalKey || 'id']);
                        
                        if (relatedIds.length === 0) {
                            relationFilteredIds = [];
                        } else {
                            // Obtener los IDs del modelo principal desde la tabla intermedia
                            const throughQuery = `
                                SELECT DISTINCT ${relation.foreignKey}
                                FROM ${relation.through}
                                WHERE ${relation.otherKey} = ANY($1::uuid[])
                            `;
                            const throughResult = await client.query<{ [key: string]: string }>(
                                throughQuery,
                                [relatedIds]
                            );
                            relationFilteredIds = throughResult.rows.map(row => row[relation.foreignKey]);
                        }
                    } else if (relation.type === 'hasMany') {
                        // Para hasMany, obtener los IDs del modelo relacionado que cumplen la condición
                        const { clause: relationClause, values: relationValues } = this.buildWhereClause(relationWhere, 1);
                        const relatedQuery = `
                            SELECT DISTINCT ${relation.foreignKey}
                            FROM ${relation.model.tableName}
                            ${relationClause}
                        `;
                        const relatedResult = await client.query<{ [key: string]: string }>(
                            relatedQuery,
                            relationValues
                        );
                        relationFilteredIds = relatedResult.rows.map(row => row[relation.foreignKey]);
                    } else if (relation.type === 'belongsTo') {
                        // Para belongsTo, obtener los IDs del modelo relacionado y luego filtrar por foreignKey
                        const { clause: relationClause, values: relationValues } = this.buildWhereClause(relationWhere, 1);
                        const relatedQuery = `
                            SELECT ${relation.localKey || 'id'}
                            FROM ${relation.model.tableName}
                            ${relationClause}
                        `;
                        const relatedResult = await client.query<{ [key: string]: string }>(
                            relatedQuery,
                            relationValues
                        );
                        const relatedIds = relatedResult.rows.map(row => row[relation.localKey || 'id']);
                        
                        // Ahora obtener los IDs del modelo principal que tienen estos foreignKeys
                        if (relatedIds.length > 0) {
                            const mainQuery = `
                                SELECT ${String(this.primaryKey)}
                                FROM ${this.tableName}
                                WHERE ${relation.foreignKey} = ANY($1::uuid[])
                            `;
                            const mainResult = await client.query<{ [key: string]: string }>(
                                mainQuery,
                                [relatedIds]
                            );
                            relationFilteredIds = mainResult.rows.map(row => row[String(this.primaryKey)]);
                        }
                    }

                    allFilteredIds.push(relationFilteredIds);
                }

                // Si hay múltiples relaciones, hacer intersección (AND)
                if (allFilteredIds.length === 0) {
                    return [];
                }

                if (allFilteredIds.length === 1) {
                    return allFilteredIds[0];
                }

                // Intersección: IDs que están en todas las listas
                return allFilteredIds.reduce((acc, ids) => 
                    acc.filter(id => ids.includes(id))
                );
            });

            if (relationFilteredIds.length === 0) {
                return [];
            }

            // Agregar el filtro de IDs al where
            // Asegurar que todos los IDs sean strings válidos
            const validIds = relationFilteredIds
                .filter(id => id != null && typeof id === 'string' && id.trim() !== '')
                .map(id => String(id).trim());
            
            if (validIds.length === 0) {
                return [];
            }
            
            filteredWhere = {
                ...filteredWhere,
                [String(this.primaryKey)]: { in: validIds }
            };
        }

        const { clause, values } = this.buildWhereClause(filteredWhere);
        const orderClause = this.buildOrderClause(order);
        const limitClause = limit ? ` LIMIT ${limit}` : '';

        let query = `SELECT * FROM ${this.tableName}${clause}${orderClause}${limitClause}`;

        const result = await this._pgService.runInTransaction<T[]>(async (client) => {
            const result = await client.query(query, values);
            const rows = result.rows;

            // Cargar relaciones si se especificaron
            if (include.length > 0) {
                return await this.loadRelations(rows, include, client);
            }

            return rows;
        });

        return result;
    }

    async create(data: Omit<T, 'updated_at' | 'created_at'>) {
        const keys = Object.keys(data as object) as Array<keyof Omit<T, 'updated_at' | 'created_at'>>;
        const values = Object.values(data as object);

        const columns = keys.join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;

        const res = await this._pgService.runInTransaction<T[]>(async (client) => {
            const result = await client.query(query, values);
            return result.rows;
        });
        return res[0];
    }

    async update(data: Omit<Partial<T>, 'id'>, options: QueryOptions<T> = {}) {
        const { where = {} } = options;
        const dataKeys = Object.keys(data as object);
        const dataValues = Object.values(data as object);

        const setClause = dataKeys.map((key, i) => `${String(key)} = $${i + 1}`).join(', ');

        const { clause, values: whereValues } = this.buildWhereClause(where, dataKeys.length);

        console.log({clause})

        const query = `UPDATE ${this.tableName} SET ${setClause}${clause} RETURNING *`;
        const queryValues = [...dataValues, ...whereValues];


        const res = await this._pgService.runInTransaction<T[]>(async (client) => {
            const result = await client.query(query, queryValues);
            return result.rows;
        });
        return res[0] || null;
    }


    async delete(options: QueryOptions<T> = {}) {
        const { where = {} } = options;
        const keys = Object.keys(where) as Array<keyof T>;
        const values = Object.values(where);

        let query = `DELETE FROM ${this.tableName}`;

        if (keys.length > 0) {
            const conditions = keys.map((key, i) => `${String(key)} = $${i + 1}`).join(' AND ');
            query += ` WHERE ${conditions}`;
        }

        query += ` RETURNING *`;

        const res = await this._pgService.runInTransaction<T[]>(async (client) => {
            const result = await client.query(query, values);
            return result.rows;
        });
        return res[0] || null;
    }

    private buildWhereClause(where: object, startingIndex: number = 0) {
        const keys = Object.keys(where);
        const conditions: string[] = [];
        const values: any[] = [];
        // Ajustar startingIndex para que sea 0-based internamente
        // Si startingIndex es 1, queremos que el primer parámetro sea $1
        let paramIndex = startingIndex > 0 ? startingIndex - 1 : 0;

        // Función auxiliar para verificar si un string parece ser un UUID
        const isUUID = (str: string): boolean => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(str);
        };

        keys.forEach((key) => {
            const value = (where as any)[key];

            // Si el valor es un objeto y tiene la propiedad 'in'
            if (value !== null && typeof value === 'object' && 'in' in value) {
                const inValues = value.in as any[];
                
                if (inValues.length === 0) {
                    // Si el array está vacío, usar una condición que siempre sea falsa
                    conditions.push('1 = 0');
                } else {
                    // Limpiar valores (trim espacios en blanco) y asegurar que sean strings
                    const cleanedValues = inValues
                        .map(v => {
                            if (v == null) return null;
                            if (typeof v === 'boolean') {
                                // Si es booleano, convertirlo a string (aunque no debería pasar aquí)
                                return String(v);
                            }
                            return typeof v === 'string' ? v.trim() : String(v);
                        })
                        .filter(v => v !== null && v !== '');
                    
                    if (cleanedValues.length === 0) {
                        conditions.push('1 = 0');
                    } else {
                        // Verificar si todos los valores son UUIDs (strings que parecen UUIDs)
                        const allAreUUIDs = cleanedValues.every(v => typeof v === 'string' && isUUID(v));
                        
                        // Si el campo es 'id' o todos los valores son UUIDs, usar uuid[]
                        // De lo contrario, usar text[]
                        const arrayType = (key === 'id' || allAreUUIDs) ? 'uuid[]' : 'text[]';
                        
                        paramIndex++;
                        conditions.push(`${String(key)} = ANY($${paramIndex}::${arrayType})`);
                        values.push(cleanedValues);
                    }
                }
            }
            // Caso por defecto: Igualdad (=)
            else {
                paramIndex++;
                // Asegurar que los valores booleanos se pasen correctamente
                if (typeof value === 'boolean') {
                    conditions.push(`${String(key)} = $${paramIndex}::boolean`);
                } else {
                    conditions.push(`${String(key)} = $${paramIndex}`);
                }
                values.push(value);
            }

        });

        const clause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

        return { clause, values };
    }

    /**
     * Construye la cláusula ORDER BY
     */
    private buildOrderClause(order?: { [key: string]: 'ASC' | 'DESC' | undefined }): string {
        if (!order || Object.keys(order).length === 0) {
            return '';
        }

        const orderParts = Object.entries(order)
            .filter(([_, direction]) => direction !== undefined)
            .map(([key, direction]) => {
                const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                return `${String(key)} ${dir}`;
            });

        if (orderParts.length === 0) {
            return '';
        }

        return ` ORDER BY ${orderParts.join(', ')}`;
    }

    /**
     * Carga las relaciones especificadas para los registros dados
     */
    private async loadRelations(rows: T[], include: IncludeConfig[], client: any): Promise<any[]> {
        const results = await Promise.all(
            rows.map(async (row: any) => {
                const rowWithRelations = { ...row };

                for (const includeItem of include) {
                    // Determinar nombre de relación y opciones
                    let relationName: string;
                    let includeOptions: IncludeOption | undefined;

                    if (typeof includeItem === 'string') {
                        relationName = includeItem;
                    } else {
                        relationName = includeItem.relation;
                        includeOptions = {
                            where: includeItem.where,
                            order: includeItem.order,
                            limit: includeItem.limit
                        };
                    }

                    const relation = this.relations.get(relationName);
                    if (!relation) {
                        console.warn(`Relation "${relationName}" not found for model ${this.tableName}`);
                        continue;
                    }

                    switch (relation.type) {
                        case 'belongsTo':
                            rowWithRelations[relationName] = await this.loadBelongsTo(
                                row,
                                relation,
                                client,
                                includeOptions
                            );
                            break;

                        case 'hasMany':
                            rowWithRelations[relationName] = await this.loadHasMany(
                                row,
                                relation,
                                client,
                                includeOptions
                            );
                            break;

                        case 'belongsToMany':
                            rowWithRelations[relationName] = await this.loadBelongsToMany(
                                row,
                                relation,
                                client,
                                includeOptions
                            );
                            break;
                    }
                }

                return rowWithRelations;
            })
        );

        return results;
    }

    /**
     * Carga una relación belongsTo
     */
    private async loadBelongsTo(
        row: any, 
        relation: BelongsToRelation, 
        client: any,
        options?: IncludeOption
    ): Promise<any> {
        const foreignKeyValue = row[relation.foreignKey];
        if (!foreignKeyValue) return null;

        const { clause, values } = this.buildWhereClause(
            options?.where || {}, 
            2 // startingIndex = 2 porque $1 es para foreignKeyValue
        );
        const orderClause = this.buildOrderClause(options?.order);
        const limitClause = options?.limit ? ` LIMIT ${options.limit}` : ' LIMIT 1';

        const query = `SELECT * FROM ${relation.model.tableName} WHERE ${relation.localKey || 'id'} = $1${clause}${orderClause}${limitClause}`;
        const result = await client.query(query, [foreignKeyValue, ...values]);
        return result.rows[0] || null;
    }

    /**
     * Carga una relación hasMany
     */
    private async loadHasMany(
        row: any, 
        relation: HasManyRelation, 
        client: any,
        options?: IncludeOption
    ): Promise<any[]> {
        const localKeyValue = row[relation.localKey || 'id'];
        if (!localKeyValue) return [];

        const { clause, values } = this.buildWhereClause(
            options?.where || {},
            2 // startingIndex = 2 porque $1 es para localKeyValue
        );
        const orderClause = this.buildOrderClause(options?.order);
        const limitClause = options?.limit ? ` LIMIT ${options.limit}` : '';

        // Construir la condición base de la relación
        const baseCondition = `${relation.foreignKey} = $1`;
        const whereClause = clause 
            ? ` WHERE ${baseCondition} AND ${clause.replace('WHERE ', '')}`
            : ` WHERE ${baseCondition}`;

        const query = `SELECT * FROM ${relation.model.tableName}${whereClause}${orderClause}${limitClause}`;
        const result = await client.query(query, [localKeyValue, ...values]);
        return result.rows || [];
    }

    /**
     * Carga una relación belongsToMany (muchos a muchos)
     */
    private async loadBelongsToMany(
        row: any, 
        relation: BelongsToManyRelation, 
        client: any,
        options?: IncludeOption
    ): Promise<any[]> {
        const localKeyValue = row[relation.localKey || 'id'];
        if (!localKeyValue) return [];

        // Query para obtener los IDs relacionados a través de la tabla intermedia
        const throughQuery = `
            SELECT ${relation.otherKey} 
            FROM ${relation.through} 
            WHERE ${relation.foreignKey} = $1
        `;
        const throughResult = await client.query(throughQuery, [localKeyValue]);

        if (!throughResult || !throughResult.rows || throughResult.rows.length === 0) return [];

        const relatedIds = throughResult.rows.map((r: any) => r[relation.otherKey]);

        if (relatedIds.length === 0) return [];

        // Construir WHERE clause para los registros relacionados
        const { clause, values } = this.buildWhereClause(
            options?.where || {},
            2 // startingIndex = 2 porque $1 es para el array de IDs
        );
        const orderClause = this.buildOrderClause(options?.order);
        const limitClause = options?.limit ? ` LIMIT ${options.limit}` : '';

        // Query para obtener los registros relacionados usando ANY para evitar problemas de inferencia de tipos
        const baseCondition = `${relation.otherLocalKey || 'id'} = ANY($1::uuid[])`;
        const whereClause = clause
            ? ` WHERE ${baseCondition} AND ${clause.replace('WHERE ', '')}`
            : ` WHERE ${baseCondition}`;

        const query = `SELECT * FROM ${relation.model.tableName}${whereClause}${orderClause}${limitClause}`;
        const result = await client.query(query, [relatedIds, ...values]);
        return result.rows || [];
    }

}


