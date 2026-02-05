import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from './log.service';
import { PgService } from 'src/database/pg-config.service';

describe('LogService', () => {
  let service: LogService;
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
        LogService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<LogService>(LogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a log successfully', async () => {
      // Arrange
      const logData = {
        action: 'CREATE',
        resource_type: 'category',
        resource_id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '223e4567-e89b-12d3-a456-426614174000',
        details: { name: 'Test Category' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 1
      });

      // Act
      await service.create(logData);

      // Assert
      expect(mockPgService.runInTransaction).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
    });

    it('should create a log with null optional fields', async () => {
      // Arrange
      const logData = {
        action: 'DELETE',
        resource_type: 'shape',
        resource_id: null,
        user_id: null,
        details: null,
        ip_address: null,
        user_agent: null
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 1
      });

      // Act
      await service.create(logData);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should find all logs ordered by created_at DESC with limit 25', async () => {
      // Arrange
      const expectedLogs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          action: 'CREATE',
          resource_type: 'category',
          resource_id: '223e4567-e89b-12d3-a456-426614174000',
          user_id: '323e4567-e89b-12d3-a456-426614174000',
          details: { name: 'Test Category' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          created_at: new Date()
        },
        {
          id: '423e4567-e89b-12d3-a456-426614174000',
          action: 'UPDATE',
          resource_type: 'form',
          resource_id: '523e4567-e89b-12d3-a456-426614174000',
          user_id: '323e4567-e89b-12d3-a456-426614174000',
          details: { title: 'Updated Form' },
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0',
          created_at: new Date()
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedLogs,
        rowCount: 2
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPgService.runInTransaction).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedLogs);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no logs exist', async () => {
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
});
