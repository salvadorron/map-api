import { Test, TestingModule } from '@nestjs/testing';
import { ParrishService } from './parrish.service';

describe('ParrishService', () => {
  let service: ParrishService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParrishService],
    }).compile();

    service = module.get<ParrishService>(ParrishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
