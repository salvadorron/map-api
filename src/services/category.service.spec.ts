import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PgService } from 'src/database/pg-config.service';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsStore } from 'src/modules/app.module';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockPgService: {
    runInTransaction: jest.Mock;
    query: jest.Mock;
  };
  let mockAls: AsyncLocalStorage<AlsStore>;
  let mockClient: any;

  beforeEach(async () => {
    // Mock del cliente de base de datos
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
        CategoryService,
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

    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      // Arrange
      const createCategoryDto = {
        name: 'Test Category',
        color: '#000000',
        element_type: 'text',
        icon: 'test-icon'
      };

      const expectedCategory = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Category',
        color: '#000000',
        element_type: 'text',
        icon: 'test-icon',
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedCategory],
        rowCount: 1
      });

      // Act
      const result = await service.create(createCategoryDto);

      // Assert
      expect(mockPgService.runInTransaction).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCategory);
    });

    it('should create a category with parent_id', async () => {
      // Arrange
      const parentId = '223e4567-e89b-12d3-a456-426614174000';
      const createCategoryDto = {
        name: 'Child Category',
        parent_id: parentId
      };

      const expectedCategory = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        name: 'Child Category',
        parent_id: parentId,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedCategory],
        rowCount: 1
      });

      // Act
      const result = await service.create(createCategoryDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCategory);
    });

    it('should create a category with institution_id', async () => {
      // Arrange
      const institutionId = '423e4567-e89b-12d3-a456-426614174000';
      const createCategoryDto = {
        name: 'Institution Category',
        institution_id: institutionId
      };

      const expectedCategory = {
        id: '523e4567-e89b-12d3-a456-426614174000',
        name: 'Institution Category',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query
        .mockResolvedValueOnce({
          rows: [expectedCategory],
          rowCount: 1
        })
        .mockResolvedValueOnce({
          rows: [],
          rowCount: 1
        });

      // Act
      const result = await service.create(createCategoryDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual(expectedCategory);
    });
  });

  describe('findAll', () => {
    it('should find all categories without filters', async () => {
      // Arrange
      const expectedCategories = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Category 1',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Category 2',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedCategories,
        rowCount: 2
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPgService.runInTransaction).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCategories);
    });

    it('should find categories with parent_ids filter', async () => {
      // Arrange
      const filters = {
        parent_ids: '123e4567-e89b-12d3-a456-426614174000,223e4567-e89b-12d3-a456-426614174000'
      };

      const expectedCategories = [
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          name: 'Child 1',
          parent_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedCategories,
        rowCount: 1
      });

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCategories);
    });

    it('should find categories filtered by institution when store has institutionId', async () => {
      // Arrange
      const institutionId = '423e4567-e89b-12d3-a456-426614174000';
      const filters = { is_public: 'false' };

      mockAls.getStore = jest.fn(() => ({ institutionId })) as any;

      const expectedCategories = [
        {
          id: '523e4567-e89b-12d3-a456-426614174000',
          name: 'Institution Category',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedCategories,
        rowCount: 1
      });

      // Act
      const result = await service.findAll(filters);

      console.log('result', result);

      // Assert
      expect(mockAls.getStore).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('findOne', () => {
    it('should find a category by id', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedCategory = {
        id: categoryId,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedCategory],
        rowCount: 1
      });

      // Act
      const result = await service.findOne(categoryId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(categoryId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Category not found');
      }
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const updateCategoryDto = {
        name: 'Updated Category',
        color: '#FF0000'
      };

      const expectedCategory = {
        id: categoryId,
        name: 'Updated Category',
        color: '#FF0000',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedCategory],
        rowCount: 1
      });

      // Act
      const result = await service.update(categoryId, updateCategoryDto);

      // Assert
      expect(result).toEqual(expectedCategory);
    });

    it('should update parent_id', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const parentId = '223e4567-e89b-12d3-a456-426614174000';
      const updateCategoryDto = {
        parent_id: parentId
      };

      const expectedCategory = {
        id: categoryId,
        parent_id: parentId,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedCategory],
        rowCount: 1
      });

      // Act
      const result = await service.update(categoryId, updateCategoryDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCategory);
    });

    it('should throw BadRequestException when no properties to update', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const updateCategoryDto = {};

      // Act & Assert
      await expect(service.update(categoryId, updateCategoryDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(categoryId, updateCategoryDto)).rejects.toThrow('Must be at least one property to patch');
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const updateCategoryDto = {
        name: 'Updated Name'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.update(categoryId, updateCategoryDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Category with ID ${categoryId} not found.`);
      }
    });
  });

  describe('remove', () => {
    it('should remove a category successfully', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedCategory = {
        id: categoryId
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [deletedCategory],
        rowCount: 1
      });

      // Act
      const result = await service.remove(categoryId);

      // Assert
  
      expect(result).toEqual({
        message: `Category with ID: (${categoryId}) has deleted successfully!`
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const categoryId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.remove(categoryId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Category not found');
      }
    });
  });
});
