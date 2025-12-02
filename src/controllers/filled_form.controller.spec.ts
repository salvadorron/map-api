import { Test, TestingModule } from '@nestjs/testing';
import { FilledFormController } from './filled_form.controller';
import { FilledFormService } from 'src/services/filled_form.service';

describe('FilledFormController', () => {
  let controller: FilledFormController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilledFormController],
      providers: [FilledFormService],
    }).compile();

    controller = module.get<FilledFormController>(FilledFormController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
