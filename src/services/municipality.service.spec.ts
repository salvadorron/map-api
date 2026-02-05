import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalityService } from './municipality.service';
import { PgService } from 'src/database/pg-config.service';
import { NotFoundException } from '@nestjs/common';

describe('MunicipalityService', () => {
  let service: MunicipalityService;
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
        MunicipalityService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<MunicipalityService>(MunicipalityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all municipalities', async () => {
      // Arrange
      const expectedMunicipalities = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Municipality A',
          short_name: 'MUN-A',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          name: 'Municipality B',
          short_name: 'MUN-B',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedMunicipalities,
        rowCount: 2
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPgService.runInTransaction).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedMunicipalities);
    });

    it('should return empty array when no municipalities exist', async () => {
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
    it('should find a municipality by id', async () => {
      // Arrange
      const municipalityId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedMunicipality = {
        id: municipalityId,
        name: 'Test Municipality',
        short_name: 'MUN-TEST',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedMunicipality],
        rowCount: 1
      });

      // Act
      const result = await service.findOne(municipalityId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedMunicipality);
    });

    it('should throw NotFoundException when municipality not found', async () => {
      // Arrange
      const municipalityId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(municipalityId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Municipality with ID ${municipalityId} not found.`);
      }
    });
  });
});
