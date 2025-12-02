import { Test, TestingModule } from '@nestjs/testing';
import { ParrishController } from './parrish.controller';
import { ParrishService } from 'src/services/parrish.service';

describe('ParrishController', () => {
  let controller: ParrishController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParrishController],
      providers: [ParrishService],
    }).compile();

    controller = module.get<ParrishController>(ParrishController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
