import { Test, TestingModule } from '@nestjs/testing';
import { FormService } from './form.service';
import { PgService } from 'src/database/pg-config.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FormService', () => {
  let service: FormService;
  let mockPgService: {
    runInTransaction: jest.Mock;
    query: jest.Mock;
  };
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      query: jest.fn(),
    };

    mockPgService = {
      runInTransaction: jest.fn((callback) => callback(mockClient)),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<FormService>(FormService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a form successfully with categories', async () => {
      // Arrange
      const createFormDto = {
        title: 'Test Form',
        tag: 'test-tag',
        category_ids: [
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174000'
        ],
        inputs: [
          {
            inputType: 'text',
            label: 'Test Input',
            placeholder: 'Enter text',
            required: true
          }
        ]
      };

      const expectedForm = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        title: 'Test Form',
        tag: 'test-tag',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock para la creación del form (dentro de runInTransaction)
      mockClient.query
        .mockResolvedValueOnce({ rows: [expectedForm], rowCount: 1 }) // INSERT form
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT form_version
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT category assignment 1
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // INSERT category assignment 2

      // Act
      const result = await service.create(createFormDto);

      // Assert
      // form (1) + version (1) + 2 category assignments (2) = 4 queries
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(result).toEqual(expectedForm);
    });

    it('should create a form without tag', async () => {
      // Arrange
      const createFormDto = {
        title: 'Test Form',
        category_ids: ['123e4567-e89b-12d3-a456-426614174000'],
        inputs: []
      };

      const expectedForm = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        title: 'Test Form',
        tag: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [expectedForm], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 });

      // Act
      const result = await service.create(createFormDto);

      // Assert
      expect(result).toEqual(expectedForm);
    });
  });

  describe('findAll', () => {
    it('should find all forms without filters', async () => {
      // Arrange
      const forms = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Form 1',
          tag: 'tag1',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const version = {
        id: '423e4567-e89b-12d3-a456-426614174000',
        form_id: '123e4567-e89b-12d3-a456-426614174000',
        version_number: 1,
        inputs: [],
        is_active: true
      };

      const categories = [
        {
          id: '523e4567-e89b-12d3-a456-426614174000',
          name: 'Category 1'
        }
      ];

      // Mock para findAll de forms
      mockClient.query
        .mockResolvedValueOnce({ rows: forms, rowCount: 1 }) // SELECT forms (findAll)
        // Para cada form, findByPk con includes genera:
        .mockResolvedValueOnce({ rows: [forms[0]], rowCount: 1 }) // SELECT form (findByPk)
        .mockResolvedValueOnce({ rows: [version], rowCount: 1 }) // SELECT versions (include con where)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT through table (vacío, no hay categorías)

      // Act
      const result = await service.findAll();

      // Assert
      // findAll forms (1) + findByPk form (1) + SELECT versions (1) + SELECT through (1) = 4
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('active_version');
      expect(result[0]).toHaveProperty('categories');
      expect(result[0].categories).toEqual([]); // Sin categorías
    });

    it('should find forms filtered by category_ids', async () => {
      // Arrange
      const filters = {
        category_ids: '123e4567-e89b-12d3-a456-426614174000,223e4567-e89b-12d3-a456-426614174000'
      };

      const forms = [
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          title: 'Form 1',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const activeVersion = {
        id: '423e4567-e89b-12d3-a456-426614174000',
        form_id: forms[0].id,
        version_number: 1,
        is_active: true
      };

      // El form filtrado por category_ids debería tener categorías relacionadas
      // Cuando hay whereRelation con belongsToMany, se hacen 3 queries:
      // 1. SELECT id FROM categories WHERE id IN (...) - obtener IDs de categorías
      // 2. SELECT DISTINCT form_id FROM through_table WHERE category_id IN (...) - obtener form_ids
      // 3. SELECT * FROM forms WHERE id IN (...) - obtener forms
      // Luego para cada form, findByPk con includes genera:
      // 4. SELECT form (findByPk)
      // 5. SELECT versions (include con where)
      // 6. SELECT through table
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: '123e4567-e89b-12d3-a456-426614174000' }, { id: '223e4567-e89b-12d3-a456-426614174000' }], rowCount: 2 }) // SELECT id FROM categories (whereRelation)
        .mockResolvedValueOnce({ rows: [{ form_id: forms[0].id }], rowCount: 1 }) // SELECT DISTINCT form_id FROM through_table (whereRelation)
        .mockResolvedValueOnce({ rows: forms, rowCount: 1 }) // SELECT forms WHERE id IN (...)
        // Para cada form, findByPk con includes genera:
        .mockResolvedValueOnce({ rows: [forms[0]], rowCount: 1 }) // SELECT form (findByPk)
        .mockResolvedValueOnce({ rows: [activeVersion], rowCount: 1 }) // SELECT versions (include con where)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT through table (vacío - no hay categorías relacionadas)

      // Act
      const result = await service.findAll(filters);

      // Assert
      // SELECT categories (1) + SELECT form_ids (1) + SELECT forms (1) + SELECT form findByPk (1) + SELECT versions (1) + SELECT through (1) = 6
      expect(mockClient.query).toHaveBeenCalledTimes(6);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('categories');
      expect(result[0].categories).toEqual([]); // Sin categorías
    });
  });

  describe('findOne', () => {
    it('should find a form by id', async () => {
      // Arrange
      const formVersionId = '123e4567-e89b-12d3-a456-426614174000';
      const version = {
        id: formVersionId,
        form_id: '223e4567-e89b-12d3-a456-426614174000',
        version_number: 1,
        inputs: [],
        is_active: true
      };

      const form = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        title: 'Test Form',
        tag: 'test-tag',
        created_at: new Date(),
        updated_at: new Date()
      };

      const categories = [
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          name: 'Category 1'
        }
      ];

      // Mock: SELECT form_version + SELECT form + SELECT categories (through relation)
      mockClient.query
        .mockResolvedValueOnce({ rows: [version], rowCount: 1 }) // SELECT form_version
        .mockResolvedValueOnce({ rows: [form], rowCount: 1 }) // SELECT form (findByPk)
        .mockResolvedValueOnce({ rows: [{ category_id: categories[0].id }], rowCount: 1 }) // SELECT through table
        .mockResolvedValueOnce({ rows: categories, rowCount: 1 }); // SELECT categories

      // Act
      const result = await service.findOne(formVersionId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(4); // form_version + form + through + categories
      expect(result).toHaveProperty('active_version');
      expect(result).toHaveProperty('categories');
      expect(result.title).toBe('Test Form');
    });

    it('should throw NotFoundException when form not found', async () => {
      // Arrange
      const formVersionId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(formVersionId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Form not found');
      }
    });
  });

  describe('update', () => {
    it('should update a form without creating new version', async () => {
      // Arrange
      const formId = '123e4567-e89b-12d3-a456-426614174000';
      const updateFormDto = {
        // No inputs, title, or tag - no new version needed
      };

      const currentForm = {
        id: formId,
        title: 'Test Form',
        tag: 'test-tag',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [currentForm], rowCount: 1 }) // Check form exists
        .mockResolvedValueOnce({ rows: [currentForm], rowCount: 1 }) // Return updated form
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Get active version

      // Act & Assert
      try {
        await service.update(formId, updateFormDto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Must be at least one property to patch');
      }
    });

    it('should update form and create new version when inputs change', async () => {
      // Arrange
      const formId = '123e4567-e89b-12d3-a456-426614174000';
      const updateFormDto = {
        inputs: [
          {
            inputType: 'text',
            label: 'Updated Input',
            required: true
          }
        ]
      };

      const currentForm = {
        id: formId,
        title: 'Test Form',
        tag: 'test-tag',
        created_at: new Date(),
        updated_at: new Date()
      };

      const updatedForm = {
        ...currentForm,
        updated_at: new Date()
      };

      const newVersion = {
        id: '423e4567-e89b-12d3-a456-426614174000',
        form_id: formId,
        version_number: 2,
        inputs: updateFormDto.inputs,
        is_active: true
      };

      const existingVersion = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        form_id: formId,
        version_number: 1,
        inputs: [],
        is_active: true
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [currentForm], rowCount: 1 }) // SELECT form (findOne)
        .mockResolvedValueOnce({ rows: [existingVersion], rowCount: 1 }) // SELECT all versions (findAll)
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // UPDATE is_active (update)
        .mockResolvedValueOnce({ rows: [newVersion], rowCount: 1 }) // INSERT new version (create)
        .mockResolvedValueOnce({ rows: [updatedForm], rowCount: 1 }) // SELECT form (findOne para retornar)
        .mockResolvedValueOnce({ rows: [newVersion], rowCount: 1 }); // SELECT active versions (findAll)

      // Act
      const result = await service.update(formId, updateFormDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(6); // findOne form + findAll versions + update + create + findOne + findAll active
      expect(result).toHaveProperty('active_version');
    });

    it('should throw NotFoundException when form not found', async () => {
      // Arrange
      const formId = '123e4567-e89b-12d3-a456-426614174000';
      const updateFormDto = {
        title: 'Updated Title'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.update(formId, updateFormDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Form with ID ${formId} not found.`);
      }
    });
  });

  describe('remove', () => {
    it('should remove a form successfully', async () => {
      // Arrange
      const formId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedForm = {
        id: formId
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [deletedForm],
        rowCount: 1
      });

      // Act
      const result = await service.remove(formId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: `Form with ID: (${formId}) has deleted successfully!`
      });
    });

    it('should throw NotFoundException when form is being used', async () => {
      // Arrange
      const formId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockRejectedValueOnce(
        new Error('Foreign key constraint violation')
      );

      // Act & Assert
      await expect(service.remove(formId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(formId)).rejects.toThrow('This form is being used by a filled form.');
    });
  });
});
