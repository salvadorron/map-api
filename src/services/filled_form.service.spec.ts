import { Test, TestingModule } from '@nestjs/testing';
import { FilledFormService } from './filled_form.service';

describe('FilledFormService', () => {
  let service: FilledFormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilledFormService],
    }).compile();

    service = module.get<FilledFormService>(FilledFormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
