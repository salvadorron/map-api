import { Test, TestingModule } from '@nestjs/testing';
import { ShapeImageController } from './shape-image.controller';
import { ShapeImageService } from 'src/services/shape-image.service';

describe('ShapeImageController', () => {
  let controller: ShapeImageController;
  let mockShapeImageService: {
    getByShape: jest.Mock;
    replace: jest.Mock;
  };

  const shapeId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    mockShapeImageService = {
      getByShape: jest.fn(),
      replace: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShapeImageController],
      providers: [
        {
          provide: ShapeImageService,
          useValue: mockShapeImageService,
        },
      ],
    }).compile();

    controller = module.get<ShapeImageController>(ShapeImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get images by shape id', async () => {
    const images = [
      { id: 'id-1', shape_id: shapeId, url: '/uploads/x.png', position: 0 },
    ];
    mockShapeImageService.getByShape.mockResolvedValue(images);

    const result = await controller.getByShape(shapeId);

    expect(mockShapeImageService.getByShape).toHaveBeenCalledWith(shapeId);
    expect(result).toEqual(images);
  });

  it('should replace images by shape id', async () => {
    const dto = {
      images: [{ url: '/uploads/new.png', name: 'new.png', size: 512 }],
    };
    mockShapeImageService.replace.mockResolvedValue(dto.images);

    const result = await controller.replace(shapeId, dto as any);

    expect(mockShapeImageService.replace).toHaveBeenCalledWith(
      shapeId,
      dto.images,
    );
    expect(result).toEqual(dto.images);
  });
});
