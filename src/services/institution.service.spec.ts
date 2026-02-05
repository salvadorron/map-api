import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionService } from './institution.service';
import { PgService } from 'src/database/pg-config.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InstitutionService', () => {
  let service: InstitutionService;
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
        InstitutionService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<InstitutionService>(InstitutionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an institution successfully', async () => {
      // Arrange
      const createInstitutionDto = {
        code: 'INST001',
        name: 'Test Institution'
      };

      const expectedInstitution = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        code: 'INST001',
        name: 'Test Institution',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedInstitution],
        rowCount: 1
      });

      // Act
      const result = await service.create(createInstitutionDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedInstitution);
    });
  });

  describe('findAll', () => {
    it('should find all institutions ordered by name', async () => {
      // Arrange
      const expectedInstitutions = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          code: 'INST001',
          name: 'Institution A',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          code: 'INST002',
          name: 'Institution B',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedInstitutions,
        rowCount: 2
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedInstitutions);
    });
  });

  describe('findOne', () => {
    it('should find an institution by id', async () => {
      // Arrange
      const institutionId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedInstitution = {
        id: institutionId,
        code: 'INST001',
        name: 'Test Institution',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedInstitution],
        rowCount: 1
      });

      // Act
      const result = await service.findOne(institutionId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedInstitution);
    });

    it('should throw NotFoundException when institution not found', async () => {
      // Arrange
      const institutionId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(institutionId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Institución con id ${institutionId} no encontrada`);
      }
    });
  });

  describe('findByCode', () => {
    it('should find an institution by code', async () => {
      // Arrange
      const code = 'INST001';
      const expectedInstitution = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        code: 'INST001',
        name: 'Test Institution',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedInstitution],
        rowCount: 1
      });

      // Act
      const result = await service.findByCode(code);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedInstitution);
    });

    it('should return null when institution not found by code', async () => {
      // Arrange
      const code = 'NONEXISTENT';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await service.findByCode(code);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an institution successfully', async () => {
      // Arrange
      const institutionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateInstitutionDto = {
        name: 'Updated Institution',
        code: 'INST001-UPDATED'
      };

      const expectedInstitution = {
        id: institutionId,
        code: 'INST001-UPDATED',
        name: 'Updated Institution',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedInstitution],
        rowCount: 1
      });

      // Act
      const result = await service.update(institutionId, updateInstitutionDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedInstitution);
    });

    it('should throw BadRequestException when no properties to update', async () => {
      // Arrange
      const institutionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateInstitutionDto = {};

      // Act & Assert
      try {
        await service.update(institutionId, updateInstitutionDto);
        fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Debe haber al menos una propiedad para actualizar');
      }
    });

    it('should throw NotFoundException when institution not found', async () => {
      // Arrange
      const institutionId = '123e4567-e89b-12d3-a456-426614174000';
      const updateInstitutionDto = {
        name: 'Updated Name'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.update(institutionId, updateInstitutionDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Institución con ID ${institutionId} no encontrada.`);
      }
    });
  });

  describe('remove', () => {
    it('should remove an institution successfully', async () => {
      // Arrange
      const institutionId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedInstitution = {
        id: institutionId
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [deletedInstitution],
        rowCount: 1
      });

      // Act
      const result = await service.remove(institutionId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: `Institución con ID: (${institutionId}) ha sido eliminada exitosamente!`
      });
    });

    it('should throw NotFoundException when institution not found', async () => {
      // Arrange
      const institutionId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.remove(institutionId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Institución no encontrada');
      }
    });
  });
});
