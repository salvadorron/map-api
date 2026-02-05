import { Test, TestingModule } from '@nestjs/testing';
import { ShapeService } from './shape.service';
import { PgService } from 'src/database/pg-config.service';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsStore } from 'src/modules/app.module';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ShapeService', () => {
  let service: ShapeService;
  let mockPgService: {
    runInTransaction: jest.Mock;
    query: jest.Mock;
  };
  let mockAls: AsyncLocalStorage<AlsStore>;
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      query: jest.fn(),
    };

    mockPgService = {
      runInTransaction: jest.fn((callback) => callback(mockClient)),
      query: jest.fn(),
    };

    mockAls = {
      getStore: jest.fn(() => null),
      run: jest.fn(),
    } as unknown as AsyncLocalStorage<AlsStore>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShapeService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
        {
          provide: AsyncLocalStorage,
          useValue: mockAls,
        },
      ],
    }).compile();

    service = module.get<ShapeService>(ShapeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a shape successfully', async () => {
      // Arrange
      const createShapeDto = {
        category_ids: ['123e4567-e89b-12d3-a456-426614174000'],
        properties: { name: 'Test Shape' },
        geom: {
          type: 'Point',
          coordinates: [-66.9, 10.5]
        } as any,
        institution_id: '223e4567-e89b-12d3-a456-426614174000'
      };

      const insertResult = {
        created_at: new Date(),
        updated_at: new Date()
      };

      const categories = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Category 1'
        }
      ];

      const shapeIdValue = '323e4567-e89b-12d3-a456-426614174000';
      const createdShape = {
        id: shapeIdValue,
        properties: createShapeDto.properties,
        geom: createShapeDto.geom,
        institution_id: createShapeDto.institution_id,
        status: 'PENDING',
        created_at: insertResult.created_at,
        updated_at: insertResult.updated_at
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [createdShape], rowCount: 1 }) // INSERT shape (createWithGeometry)
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT category relation
        .mockResolvedValueOnce({ rows: [createdShape], rowCount: 1 }) // SELECT shape (findByPk - nueva transacción)
        .mockResolvedValueOnce({ rows: categories, rowCount: 1 }); // SELECT categories

      // Act
      const result = await service.create(createShapeDto);


      // Assert
      // INSERT shape (1) + INSERT category (1) + SELECT shape (1) + SELECT through (1) + SELECT categories (1) = 5
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(result.type).toBe('Feature');
      expect(result.geometry).toEqual(createShapeDto.geom);
      expect(result.properties.categories).toEqual(categories);
    });

    it('should create a shape without institution_id', async () => {
      // Arrange
      const createShapeDto = {
        category_ids: ['123e4567-e89b-12d3-a456-426614174000'],
        properties: {},
        geom: {
          type: 'Point',
          coordinates: [-66.9, 10.5]
        } as any
      };

      const insertResult = {
        created_at: new Date(),
        updated_at: new Date()
      };

      const createdShape = {
        id: 'shape-id',
        properties: {},
        geom: createShapeDto.geom,
        institution_id: null,
        status: 'PENDING',
        created_at: insertResult.created_at,
        updated_at: insertResult.updated_at
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [createdShape], rowCount: 1 }) // INSERT shape (createWithGeometry)
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT category relation
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT through table (vacío, no hay categorías)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT categories (findByPk con includes, vacío)

      // Act
      const result = await service.create(createShapeDto);

      // Assert
      expect(result.type).toBe('Feature');
      expect(result.properties.categories).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should find all shapes without filters', async () => {
      // Arrange
      const shapes = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          geom: { type: 'Point', coordinates: [-66.9, 10.5] },
          properties: { name: 'Shape 1' },
          status: 'APPROVED',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const categories = [];

      mockClient.query
        .mockResolvedValueOnce({ rows: shapes, rowCount: 1 }) // SELECT shapes (findAllWithComplexFilters)
        .mockResolvedValueOnce({ rows: [{ category_id: '' }], rowCount: 0 }) // SELECT through table (vacío)
        .mockResolvedValueOnce({ rows: categories, rowCount: 0 }); // SELECT categories (includes)

      // Act
      const result = await service.findAll({});

      // Assert
      // SELECT shapes (1) + SELECT through (1) = 2
      // Nota: Si la tabla intermedia está vacía, no se ejecuta SELECT categories
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Feature');
      expect(result[0].properties.categories).toEqual([]);
    });

    it('should find shapes filtered by status', async () => {
      // Arrange
      const filters = {
        status: 'APPROVED'
      };

      const shapes = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          geom: { type: 'Point', coordinates: [-66.9, 10.5] },
          properties: {},
          status: 'APPROVED',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: shapes, rowCount: 1 }) // SELECT shapes (findAllWithComplexFilters)
        .mockResolvedValueOnce({ rows: [{ category_id: '' }], rowCount: 0 }) // SELECT through table (vacío)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT categories (includes)

      // Act
      const result = await service.findAll(filters);

      // Assert
      // SELECT shapes (1) + SELECT through (1) = 2
      // Nota: Si la tabla intermedia está vacía, no se ejecuta SELECT categories
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should find a shape by id', async () => {
      // Arrange
      const shapeId = '123e4567-e89b-12d3-a456-426614174000';
      const shape = {
        id: shapeId,
        geom: { type: 'Point', coordinates: [-66.9, 10.5] },
        properties: { name: 'Test Shape' },
        status: 'APPROVED',
        created_at: new Date(),
        updated_at: new Date()
      };

      const categories = [
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Category 1'
        }
      ];

      // Mock para findOneWithGeometry que incluye las categorías
      // findOneWithGeometry ejecuta una transacción, y luego findByPk ejecuta otra
      mockClient.query
        .mockResolvedValueOnce({ rows: [shape], rowCount: 1 }) // SELECT shape (findOneWithGeometry)
        .mockResolvedValueOnce({ rows: [shape], rowCount: 1 }) // SELECT shape (findByPk - nueva transacción)
        .mockResolvedValueOnce({ rows: [{ category_id: categories[0].id }], rowCount: 1 }) // SELECT through table
        .mockResolvedValueOnce({ rows: categories, rowCount: 1 }); // SELECT categories

      // Act
      const result = await service.findOne(shapeId);

      // Assert
      // SELECT shape (findOneWithGeometry) (1) + SELECT shape (findByPk) (1) + SELECT through (1) + SELECT categories (1) = 4
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(result.type).toBe('Feature');
      expect(result.properties.id).toBe(shapeId);
      expect(result.properties.categories).toEqual(categories);
    });

    it('should throw NotFoundException when shape not found', async () => {
      // Arrange
      const shapeId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(shapeId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Shape not found');
      }
    });
  });

  describe('update', () => {
    it('should update a shape successfully', async () => {
      // Arrange
      const shapeId = '123e4567-e89b-12d3-a456-426614174000';
      const updateShapeDto = {
        status: 'APPROVED',
        properties: { name: 'Updated Shape' }
      };

      const updatedShape = {
        id: shapeId,
        geom: { type: 'Point', coordinates: [-66.9, 10.5] },
        properties: { name: 'Updated Shape' },
        status: 'APPROVED',
        created_at: new Date(),
        updated_at: new Date()
      };

      const categories = [];

      mockClient.query
        .mockResolvedValueOnce({ rows: [updatedShape], rowCount: 1 }) // UPDATE shape (updateWithGeometry)
        .mockResolvedValueOnce({ rows: [updatedShape], rowCount: 1 }) // SELECT updated shape (findOneWithGeometry)
        .mockResolvedValueOnce({ rows: [updatedShape], rowCount: 1 }) // SELECT shape (findByPk - nueva transacción)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT through table (vacío, no ejecuta SELECT categories)

      // Act
      const result = await service.update(shapeId, updateShapeDto);

      // Assert
      // UPDATE shape (1) + SELECT shape (findOneWithGeometry) (1) + SELECT shape (findByPk) (1) + SELECT through (1) = 4
      // Nota: Si la tabla intermedia está vacía, no se ejecuta SELECT categories
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(result.type).toBe('Feature');
      expect(result.properties.status).toBe('APPROVED');
    });

    it('should throw BadRequestException when no properties to update', async () => {
      // Arrange
      const shapeId = '123e4567-e89b-12d3-a456-426614174000';
      const updateShapeDto = {};

      // Act & Assert
      await expect(service.update(shapeId, updateShapeDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(shapeId, updateShapeDto)).rejects.toThrow('Must be at least one property to patch');
    });
  });

  describe('remove', () => {
    it('should remove a shape successfully', async () => {
      // Arrange
      const shapeId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedShape = {
        id: shapeId
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [deletedShape],
        rowCount: 1
      });

      // Act
      const result = await service.remove(shapeId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: `Shape with ID: (${shapeId}) has deleted successfully!`
      });
    });

    it('should throw NotFoundException when shape not found', async () => {
      // Arrange
      const shapeId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.remove(shapeId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Shape not found');
      }
    });
  });
});
