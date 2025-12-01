import { Test, TestingModule } from '@nestjs/testing';
import { ShapeController } from './shape.controller';
import { ShapeService } from './shape.service';

describe('ShapeController', () => {
  let controller: ShapeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShapeController],
      providers: [ShapeService],
    }).compile();

    controller = module.get<ShapeController>(ShapeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
