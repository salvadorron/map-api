import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShapeImageService } from './shape-image.service';
import { PgService } from 'src/database/pg-config.service';

describe('ShapeImageService', () => {
  let service: ShapeImageService;
  let mockPgService: {
    runInTransaction: jest.Mock;
    query: jest.Mock;
  };
  let mockClient: any;

  const shapeId = '123e4567-e89b-12d3-a456-426614174000';
  const anotherShapeId = '223e4567-e89b-12d3-a456-426614174000';

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
        ShapeImageService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<ShapeImageService>(ShapeImageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByShape', () => {
    it('should return images ordered by position', async () => {
      const images = [
        {
          id: 'id-1',
          shape_id: shapeId,
          url: '/uploads/one.png',
          name: 'one.png',
          size: 1024,
          position: 0,
          created_at: new Date(),
        },
        {
          id: 'id-2',
          shape_id: shapeId,
          url: '/uploads/two.png',
          name: 'two.png',
          size: 2048,
          position: 1,
          created_at: new Date(),
        },
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: shapeId }], rowCount: 1 }) // SELECT shape exists
        .mockResolvedValueOnce({ rows: images, rowCount: 2 }); // SELECT images

      const result = await service.getByShape(shapeId);

      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual(images);
    });

    it('should return an empty list for a shape without images', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: shapeId }], rowCount: 1 }) // SELECT shape exists
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT images empty

      const result = await service.getByShape(shapeId);

      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException when shape does not exist', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(service.getByShape(shapeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('replace', () => {
    it('should replace images keeping the provided order', async () => {
      const imagesInput = [
        { url: '/uploads/new-one.png', name: 'new-one.png', size: 512 },
        { url: '/uploads/new-two.png' },
      ];

      const persisted = [
        {
          id: 'id-1',
          shape_id: shapeId,
          url: '/uploads/new-one.png',
          name: 'new-one.png',
          size: 512,
          position: 0,
          created_at: new Date(),
        },
        {
          id: 'id-2',
          shape_id: shapeId,
          url: '/uploads/new-two.png',
          name: null,
          size: null,
          position: 1,
          created_at: new Date(),
        },
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: shapeId }], rowCount: 1 }) // SELECT shape exists
        .mockResolvedValueOnce({ rowCount: 2 }) // DELETE old rows
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT first
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT second
        .mockResolvedValueOnce({ rows: persisted, rowCount: 2 }); // SELECT persisted

      const result = await service.replace(shapeId, imagesInput);

      expect(mockClient.query).toHaveBeenCalledTimes(5);

      const deleteCall = mockClient.query.mock.calls[1];
      expect(deleteCall[0]).toContain('DELETE FROM shape_images');
      expect(deleteCall[1]).toEqual([shapeId]);

      const lastCall = mockClient.query.mock.calls[4];
      expect(lastCall[0]).toContain('ORDER BY position ASC');

      expect(result).toEqual(persisted);
    });

    it('should throw NotFoundException when shape does not exist', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await expect(
        service.replace(shapeId, [{ url: '/uploads/x.png' }]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should persist a different shape without affecting the other', async () => {
      const imagesInput = [{ url: '/uploads/only-mapdb.png' }];
      const persisted = [
        {
          id: 'id-1',
          shape_id: anotherShapeId,
          url: '/uploads/only-mapdb.png',
          name: null,
          size: null,
          position: 0,
          created_at: new Date(),
        },
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ id: anotherShapeId }], rowCount: 1 }) // SELECT shape exists
        .mockResolvedValueOnce({ rowCount: 0 }) // DELETE old rows
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // INSERT
        .mockResolvedValueOnce({ rows: persisted, rowCount: 1 }); // SELECT persisted

      const result = await service.replace(anotherShapeId, imagesInput);

      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(result).toEqual(persisted);
    });
  });
});
