import { Test, TestingModule } from '@nestjs/testing';
import { ParrishService } from './parrish.service';
import { PgService } from 'src/database/pg-config.service';
import { NotFoundException } from '@nestjs/common';

describe('ParrishService', () => {
  let service: ParrishService;
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
        ParrishService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<ParrishService>(ParrishService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all parrishes without filters', async () => {
      // Arrange
      const expectedParrishes = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Parrish A',
          code: '001',
          municipality_id: '223e4567-e89b-12d3-a456-426614174000',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '323e4567-e89b-12d3-a456-426614174000',
          name: 'Parrish B',
          code: '002',
          municipality_id: '223e4567-e89b-12d3-a456-426614174000',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedParrishes,
        rowCount: 2
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPgService.runInTransaction).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedParrishes);
    });

    it('should find parrishes filtered by municipalityIds', async () => {
      // Arrange
      const filters = {
        municipalityIds: '223e4567-e89b-12d3-a456-426614174000'
      };

      const expectedParrishes = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Parrish A',
          code: '001',
          municipality_id: '223e4567-e89b-12d3-a456-426614174000',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedParrishes,
        rowCount: 1
      });

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedParrishes);
    });

    it('should find parrishes filtered by multiple municipalityIds', async () => {
      // Arrange
      const filters = {
        municipalityIds: '223e4567-e89b-12d3-a456-426614174000,423e4567-e89b-12d3-a456-426614174000'
      };

      const expectedParrishes = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Parrish A',
          municipality_id: '223e4567-e89b-12d3-a456-426614174000',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '523e4567-e89b-12d3-a456-426614174000',
          name: 'Parrish C',
          municipality_id: '423e4567-e89b-12d3-a456-426614174000',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedParrishes,
        rowCount: 2
      });

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedParrishes);
    });

    it('should ignore municipalityIds filter when it contains ALL', async () => {
      // Arrange
      const filters = {
        municipalityIds: 'ALL'
      };

      const expectedParrishes = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Parrish A',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedParrishes,
        rowCount: 1
      });

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedParrishes);
    });

    it('should return empty array when no parrishes exist', async () => {
      // Arrange
      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find a parrish by id', async () => {
      // Arrange
      const parrishId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedParrish = {
        id: parrishId,
        name: 'Test Parrish',
        code: '001',
        municipality_id: '223e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedParrish],
        rowCount: 1
      });

      // Act
      const result = await service.findOne(parrishId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedParrish);
    });

    it('should throw NotFoundException when parrish not found', async () => {
      // Arrange
      const parrishId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(parrishId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Parrish with ID ${parrishId} not found.`);
      }
    });
  });
});
