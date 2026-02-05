import { Test, TestingModule } from '@nestjs/testing';
import { FilledFormService } from './filled_form.service';
import { PgService } from 'src/database/pg-config.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FilledFormService', () => {
  let service: FilledFormService;
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
        FilledFormService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<FilledFormService>(FilledFormService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a filled form successfully', async () => {
      // Arrange
      const createFilledFormDto = {
        form_id: '123e4567-e89b-12d3-a456-426614174000',
        shape_id: '223e4567-e89b-12d3-a456-426614174000',
        records: new Map([
          ['field1', { value: 'test value', label: 'Test Field', type: 'text' }]
        ]),
        title: 'Test Filled Form',
        user_id: '323e4567-e89b-12d3-a456-426614174000'
      };

      const formVersion = {
        id: '423e4567-e89b-12d3-a456-426614174000'
      };

      const filledForm = {
        id: '523e4567-e89b-12d3-a456-426614174000',
        form_version_id: formVersion.id,
        shape_id: createFilledFormDto.shape_id,
        records: { field1: { value: 'test value', label: 'Test Field', type: 'text' } },
        title: 'Test Filled Form',
        user_id: createFilledFormDto.user_id,
        created_at: new Date(),
        updated_at: new Date()
      };

      const formIdResult = {
        form_id: createFilledFormDto.form_id
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [formVersion], rowCount: 1 }) // Get active version
        .mockResolvedValueOnce({ rows: [filledForm], rowCount: 1 }); // INSERT filled form

      // Act
      const result = await service.create(createFilledFormDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(2); // SELECT form_version + INSERT filled_form
      expect(result).toHaveProperty('form_id');
      expect(result.title).toBe('Test Filled Form');
    });

    it('should throw NotFoundException when no active version found', async () => {
      // Arrange
      const createFilledFormDto = {
        form_id: '123e4567-e89b-12d3-a456-426614174000',
        shape_id: '223e4567-e89b-12d3-a456-426614174000',
        records: new Map([['field1', { value: 'test', label: 'Test' }]]),
        title: 'Test Form'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.create(createFilledFormDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`No active version found for form with ID ${createFilledFormDto.form_id}`);
      }
    });
  });

  describe('findAll', () => {
    it('should find all filled forms without filters', async () => {
      // Arrange
      const filledForms = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          form_version_id: '323e4567-e89b-12d3-a456-426614174000',
          shape_id: '423e4567-e89b-12d3-a456-426614174000',
          records: {},
          title: 'Test Form',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const formVersion = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        form_id: '223e4567-e89b-12d3-a456-426614174000',
        version_number: 1,
        is_active: true
      };

      const expectedFilledForms = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          form_id: '223e4567-e89b-12d3-a456-426614174000',
          form_version_id: '323e4567-e89b-12d3-a456-426614174000',
          shape_id: '423e4567-e89b-12d3-a456-426614174000',
          records: {},
          title: 'Test Form',
          created_at: filledForms[0].created_at,
          updated_at: filledForms[0].updated_at
        }
      ];

      // Mock: SELECT filled_forms + SELECT form_version para cada filled_form
      mockClient.query
        .mockResolvedValueOnce({ rows: filledForms, rowCount: 1 }) // SELECT filled_forms
        .mockResolvedValueOnce({ rows: [formVersion], rowCount: 1 }); // SELECT form_version

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(2); // SELECT filled_forms + SELECT form_version
      expect(result).toEqual(expectedFilledForms);
    });

    it('should find filled forms filtered by shape_id', async () => {
      // Arrange
      const filters = {
        shape_id: '223e4567-e89b-12d3-a456-426614174000'
      };

      const filledForms = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          form_version_id: '323e4567-e89b-12d3-a456-426614174000',
          shape_id: filters.shape_id,
          records: {},
          title: 'Test Form',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const formVersion = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        form_id: '323e4567-e89b-12d3-a456-426614174000',
        version_number: 1,
        is_active: true
      };

      const expectedFilledForms = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          form_id: '323e4567-e89b-12d3-a456-426614174000',
          form_version_id: '323e4567-e89b-12d3-a456-426614174000',
          shape_id: filters.shape_id,
          records: {},
          title: 'Test Form',
          created_at: filledForms[0].created_at,
          updated_at: filledForms[0].updated_at
        }
      ];

      // Mock: SELECT filled_forms + SELECT form_version para cada filled_form
      mockClient.query
        .mockResolvedValueOnce({ rows: filledForms, rowCount: 1 }) // SELECT filled_forms
        .mockResolvedValueOnce({ rows: [formVersion], rowCount: 1 }); // SELECT form_version

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(2); // SELECT filled_forms + SELECT form_version
      expect(result).toEqual(expectedFilledForms);
    });
  });

  describe('findOne', () => {
    it('should find a filled form by id', async () => {
      // Arrange
      const filledFormId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedFilledForm = {
        id: filledFormId,
        form_version_id: '223e4567-e89b-12d3-a456-426614174000',
        shape_id: '323e4567-e89b-12d3-a456-426614174000',
        records: {},
        title: 'Test Form',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedFilledForm],
        rowCount: 1
      });

      // Act
      const result = await service.findOne(filledFormId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedFilledForm);
    });

    it('should throw NotFoundException when filled form not found', async () => {
      // Arrange
      const filledFormId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(filledFormId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Filled form with ID ${filledFormId} not found.`);
      }
    });
  });

  describe('update', () => {
    it('should update a filled form successfully', async () => {
      // Arrange
      const filledFormId = '123e4567-e89b-12d3-a456-426614174000';
      const updateFilledFormDto = {
        title: 'Updated Title',
        records: new Map([['field1', { value: 'updated', label: 'Field' }]])
      };

      const updatedFilledForm = {
        id: filledFormId,
        form_version_id: '223e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Title',
        records: { field1: { value: 'updated', label: 'Field' } },
        created_at: new Date(),
        updated_at: new Date()
      };

      const formIdResult = {
        form_id: '323e4567-e89b-12d3-a456-426614174000'
      };

      const formVersion = {
        id: updatedFilledForm.form_version_id,
        form_id: formIdResult.form_id,
        version_number: 1,
        is_active: true
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [updatedFilledForm], rowCount: 1 }) // UPDATE filled_form
        .mockResolvedValueOnce({ rows: [formVersion], rowCount: 1 }); // SELECT form_version para obtener form_id

      // Act
      const result = await service.update(filledFormId, updateFilledFormDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(2); // UPDATE filled_form + SELECT form_version
      expect(result).toHaveProperty('form_id');
      expect(result.title).toBe('Updated Title');
    });

    it('should throw BadRequestException when no properties to update', async () => {
      // Arrange
      const filledFormId = '123e4567-e89b-12d3-a456-426614174000';
      const updateFilledFormDto = {};

      // Act & Assert
      try {
        await service.update(filledFormId, updateFilledFormDto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Must be at least one property to patch');
      }
    });
  });

  describe('remove', () => {
    it('should remove a filled form successfully', async () => {
      // Arrange
      const filledFormId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedFilledForm = {
        id: filledFormId
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [deletedFilledForm],
        rowCount: 1
      });

      // Act
      const result = await service.remove(filledFormId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: `Filled form with ID: (${filledFormId}) has deleted successfully!`
      });
    });

    it('should throw NotFoundException when filled form not found', async () => {
      // Arrange
      const filledFormId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.remove(filledFormId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Filled form with ID ${filledFormId} not found.`);
      }
    });
  });
});

