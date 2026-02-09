import { BaseModel } from 'src/database/base-model';
import { Model } from 'src/database/model.config';
import { Shape } from 'src/entities/shape.entity';
import { Category } from 'src/entities/category.entity';
import { PgService } from 'src/database/pg-config.service';
import { NotFoundException } from '@nestjs/common';
import { Geometry } from 'geojson';

type ShapeCategoryAssignment = {
  shape_id: string;
  category_id: string;
};

type ShapeWithGeometry = Shape;

export class ShapeModel extends BaseModel<Shape> {
  private categoryModel: Model<Category>;
  private shapeCategoryModel: Model<ShapeCategoryAssignment>;

  constructor(pgService: PgService) {
    super('shapes', pgService);
  }

  protected initializeRelations(): void {
    // Crear modelos relacionados internamente
    this.categoryModel = new Model<Category>('categories', this.pgService);
    this.shapeCategoryModel = new Model<ShapeCategoryAssignment>('shapes_categories', this.pgService);

    // Definir relaciones - se ejecuta automáticamente
    this.model.belongsToMany(
      'categories',
      this.categoryModel,
      'shapes_categories',
      'shape_id',
      'category_id'
    );
  }

  // Exponer modelos relacionados si se necesitan en el servicio
  getCategoryModel(): Model<Category> {
    this.initialize(); // Asegurar que las relaciones estén inicializadas
    return this.categoryModel;
  }

  getShapeCategoryModel(): Model<ShapeCategoryAssignment> {
    this.initialize(); // Asegurar que las relaciones estén inicializadas
    return this.shapeCategoryModel;
  }

  /**
   * Sobreescribe create para manejar automáticamente geometrías GeoJSON
   * Convierte automáticamente GeoJSON a PostGIS usando ST_GeomFromGeoJSON
   */
  async create(data: Omit<Shape, 'updated_at' | 'created_at' | 'geom'> & { geom: Geometry }): Promise<ShapeWithGeometry> {
    this.initialize();
    const { geom, ...otherData } = data;
    const keys = Object.keys(otherData) as Array<keyof typeof otherData>;
    const values = Object.values(otherData);
    
    // Construir la query con ST_GeomFromGeoJSON para el campo geom
    const tableName = (this.model as any).tableName || 'shapes';
    const columns = [...keys, 'geom'].join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ') + `, ST_GeomFromGeoJSON($${keys.length + 1})`;
    const query = `INSERT INTO ${tableName} (${columns}, created_at, updated_at) VALUES (${placeholders}, $${keys.length + 2}, $${keys.length + 3}) RETURNING id, properties, ST_AsGeoJSON(geom)::json as geom, institution_id, status, created_at, updated_at`;

    const result = await this.pgService.runInTransaction<ShapeWithGeometry[]>(async (client) => {
      const result = await client.query<ShapeWithGeometry>(query, [
        ...values,
        JSON.stringify(geom),
        new Date(),
        new Date()
      ]);
      return result.rows;
    });

    return result[0];
  }

  /**
   * Sobreescribe findByPk para manejar automáticamente geometrías
   * Convierte automáticamente PostGIS a GeoJSON usando ST_AsGeoJSON
   */
  async findByPk(id: string, include?: string[] | Array<{ relation: string; where?: any; order?: any; limit?: number }>): Promise<ShapeWithGeometry | null> {
    this.initialize();
    const tableName = (this.model as any).tableName || 'shapes';
    const query = `
      SELECT 
        id,
        properties, 
        ST_AsGeoJSON(geom)::json as geom,
        institution_id,
        status,
        created_at, 
        updated_at 
      FROM ${tableName}
      WHERE id = $1
    `;

    const result = await this.pgService.runInTransaction<ShapeWithGeometry[]>(async (client) => {
      const result = await client.query<ShapeWithGeometry>(query, [id]);
      const rows = result.rows;

      if (rows.length === 0) {
        return [];
      }

      // Cargar relaciones si se especificaron
      if (include && include.length > 0) {
        // Preservar el geom GeoJSON antes de cargar relaciones
        const shapeWithGeoJSON = rows[0];
        // Usar loadRelations del modelo base para cargar las relaciones
        const rowsWithRelations = await (this.model as any).loadRelations(rows, include, client);
        
        if (rowsWithRelations.length > 0) {
          // Preservar el geom GeoJSON y agregar las relaciones
          return [{
            ...rowsWithRelations[0],
            geom: shapeWithGeoJSON.geom
          }];
        }
        
        return rows;
      }

      return rows;
    });

    return result[0] || null;
  }

  /**
   * Sobreescribe findOne para manejar automáticamente geometrías
   * Convierte automáticamente PostGIS a GeoJSON usando ST_AsGeoJSON
   */
  async findOne(options?: {
    where?: any;
    include?: string[] | Array<{ relation: string; where?: any; order?: any; limit?: number }>;
    order?: any;
    limit?: number;
  }): Promise<ShapeWithGeometry | null> {
    this.initialize();
    const where = options?.where || {};
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);
    
    let whereClause = '';
    if (whereKeys.length > 0) {
      const conditions = whereKeys.map((key, i) => `"${key}" = $${i + 1}`).join(' AND ');
      whereClause = `WHERE ${conditions}`;
    }

    const tableName = (this.model as any).tableName || 'shapes';
    const query = `
      SELECT 
        id,
        properties, 
        ST_AsGeoJSON(geom)::json as geom,
        institution_id,
        status,
        created_at, 
        updated_at 
      FROM ${tableName}
      ${whereClause}
      LIMIT 1
    `;

    const result = await this.pgService.runInTransaction<ShapeWithGeometry[]>(async (client) => {
      const result = await client.query<ShapeWithGeometry>(query, whereValues);
      return result.rows;
    });

    if (result.length === 0) {
      return null;
    }

    const shape = result[0];

    // Cargar relaciones si se especificaron
    if (options?.include && options.include.length > 0) {
      const shapeWithRelations = await this.findByPk(shape.id, options.include);
      if (shapeWithRelations) {
        return {
          ...shape,
          ...(shapeWithRelations as any)
        } as ShapeWithGeometry;
      }
    }

    return shape;
  }

  /**
   * Sobreescribe findAll para manejar automáticamente geometrías y filtros complejos
   * Convierte automáticamente PostGIS a GeoJSON usando ST_AsGeoJSON
   * Soporta filtros complejos como municipality (JSONB) a través de opciones extendidas
   */
  async findAll(options?: {
    where?: any;
    include?: string[] | Array<{ relation: string; where?: any; order?: any; limit?: number }>;
    order?: any;
    limit?: number;
    whereRelation?: any;
    // Opciones extendidas para filtros complejos
    institution_id?: string;
    status?: string;
    municipality?: string;
  }): Promise<ShapeWithGeometry[]> {
    this.initialize();
    
    // Si hay whereRelation, usar el método del Model base para obtener los shapes filtrados
    // y luego aplicar la conversión de geometrías
    if (options?.whereRelation && Object.keys(options.whereRelation).length > 0) {
      // Usar el método findAll del Model base para obtener los shapes filtrados
      const filteredShapes = await this.model.findAll({
        whereRelation: options.whereRelation,
        where: options.where
      });

      if (filteredShapes.length === 0) {
        return [];
      }

      // Obtener solo los IDs
      const filteredIds = filteredShapes.map((shape: any) => shape.id);
      
      // Aplicar los filtros adicionales (institution_id, status, municipality)
      // construyendo una consulta con los IDs filtrados
      const tableName = (this.model as any).tableName || 'shapes';
      const baseQuery = `
        SELECT
          id,
          properties, 
          ST_AsGeoJSON(geom)::json as geom,
          institution_id,
          status,
          created_at, 
          updated_at 
        FROM ${tableName}
      `;

      const conditions: string[] = [`id = ANY($1::uuid[])`];
      const values: any[] = [filteredIds];
      let paramIndex = 2;

      // Aplicar filtros adicionales
      if (options?.institution_id) {
        conditions.push(`institution_id = $${paramIndex}`);
        values.push(options.institution_id);
        paramIndex++;
      }

      if (options?.status) {
        conditions.push(`status = $${paramIndex}`);
        values.push(options.status);
        paramIndex++;
      }

      if (options?.municipality && !options.municipality.includes('ALL')) {
        const municipalities = options.municipality.split(',').map(mun => mun.trim());
        conditions.push(`properties->>'cod_mun' = ANY($${paramIndex}::text[])`);
        values.push(municipalities);
        paramIndex++;
      }

      // parrish filtering removed

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      // Construir ORDER BY
      let orderClause = '';
      if (options?.order) {
        const orderKeys = Object.keys(options.order);
        const orderParts = orderKeys
          .filter(key => options.order![key])
          .map(key => `"${key}" ${options.order![key]}`);
        if (orderParts.length > 0) {
          orderClause = ` ORDER BY ${orderParts.join(', ')}`;
        }
      }
      const limitClause = options?.limit ? ` LIMIT ${options.limit}` : '';

      const query = `${baseQuery} ${whereClause}${orderClause}${limitClause}`.trim();

      const shapes = await this.pgService.runInTransaction<ShapeWithGeometry[]>(async (client) => {
        const result = await client.query<ShapeWithGeometry>(query, values);
        return result.rows;
      });


      // Cargar relaciones si se especificaron
      if (options?.include && options.include.length > 0) {
        const result = await Promise.all(
          shapes.map(async (shape) => {
            const shapeWithRelations = await this.findByPk(shape.id, options.include!);
            if (shapeWithRelations) {
              return {
                ...shape,
                ...(shapeWithRelations as any)
              } as ShapeWithGeometry;
            }
            return shape;
          })
        );
        return result;
      }


      return shapes;
    }
    
    // Si no hay whereRelation, continuar con la lógica normal
    let filteredWhere = { ...(options?.where || {}) };
    
    const tableName = (this.model as any).tableName || 'shapes';
    const baseQuery = `
      SELECT
        id,
        properties, 
        ST_AsGeoJSON(geom)::json as geom,
        institution_id,
        status,
        created_at, 
        updated_at 
      FROM ${tableName}
    `;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Manejar filtros estándar (where) - usar filteredWhere que puede incluir IDs de whereRelation
    if (Object.keys(filteredWhere).length > 0) {
      const whereKeys = Object.keys(filteredWhere);
      whereKeys.forEach(key => {
        const value = filteredWhere[key];
        if (value && typeof value === 'object' && 'in' in value) {
          conditions.push(`"${key}" = ANY($${paramIndex}::uuid[])`);
          values.push(value.in);
        } else {
          conditions.push(`"${key}" = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      });
    }

    // Manejar filtros extendidos (institution_id, status, municipality)
    if (options?.institution_id) {
      conditions.push(`institution_id = $${paramIndex}`);
      values.push(options.institution_id);
      paramIndex++;
    }

    if (options?.status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(options.status);
      paramIndex++;
    }

    if (options?.municipality && !options.municipality.includes('ALL')) {
      const municipalities = options.municipality.split(',').map(mun => mun.trim());
      conditions.push(`properties->>'cod_mun' = ANY($${paramIndex}::text[])`);
      values.push(municipalities);
      paramIndex++;
    }

    // parrish filtering removed

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Construir ORDER BY
    let orderClause = '';
    if (options?.order) {
      const orderKeys = Object.keys(options.order);
      const orderParts = orderKeys
        .filter(key => options.order![key])
        .map(key => `"${key}" ${options.order![key]}`);
      if (orderParts.length > 0) {
        orderClause = ` ORDER BY ${orderParts.join(', ')}`;
      }
    }

    // Construir LIMIT
    const limitClause = options?.limit ? ` LIMIT ${options.limit}` : '';

    const query = `${baseQuery} ${whereClause}${orderClause}${limitClause}`.trim();


    const shapes = await this.pgService.runInTransaction<ShapeWithGeometry[]>(async (client) => {
      const result = await client.query<ShapeWithGeometry>(query, values.length > 0 ? values : undefined);
      return result.rows;
    });

    // Cargar relaciones si se especificaron
    if (options?.include && options.include.length > 0) {
      const result = await Promise.all(
        shapes.map(async (shape) => {
          const shapeWithRelations = await this.findByPk(shape.id, options.include!);
          if (shapeWithRelations) {
            return {
              ...shape,
              ...(shapeWithRelations as any)
            } as ShapeWithGeometry;
          }
          return shape;
        })
      );

      return result;
    }



    return shapes;
  }

  /**
   * Sobreescribe update para manejar automáticamente geometrías
   * Convierte automáticamente GeoJSON a PostGIS usando ST_GeomFromGeoJSON si se proporciona geom
   */
  async update(
    data: Partial<Omit<Shape, 'id' | 'updated_at' | 'created_at'>> & { geom?: Geometry },
    options: { where: any }
  ): Promise<ShapeWithGeometry> {
    this.initialize();
    const { geom, ...otherData } = data;
    const updates: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Manejar campos normales
    Object.keys(otherData).forEach(key => {
      updates.push(`"${key}" = $${paramIndex}`);
      updateValues.push((otherData as any)[key]);
      paramIndex++;
    });

    // Manejar geom si se proporciona
    if (geom !== undefined) {
      updates.push(`geom = ST_GeomFromGeoJSON($${paramIndex})`);
      updateValues.push(JSON.stringify(geom));
      paramIndex++;
    }

    // Agregar updated_at
    updates.push(`updated_at = NOW()`);

    // Construir WHERE clause
    const whereKeys = Object.keys(options.where);
    const whereValues = Object.values(options.where);
    const whereConditions = whereKeys.map((key, i) => `"${key}" = $${paramIndex + i}`).join(' AND ');
    whereValues.forEach(value => updateValues.push(value));

    const tableName = (this.model as any).tableName || 'shapes';
    const query = `
      UPDATE ${tableName}
      SET ${updates.join(', ')}
      WHERE ${whereConditions}
      RETURNING id, properties, ST_AsGeoJSON(geom)::json as geom, institution_id, status, created_at, updated_at
    `;

    const result = await this.pgService.runInTransaction<ShapeWithGeometry[]>(async (client) => {
      const result = await client.query<ShapeWithGeometry>(query, updateValues);
      return result.rows;
    });

    if (result.length === 0) {
      throw new NotFoundException(`Shape not found`);
    }

    return result[0];
  }
}
