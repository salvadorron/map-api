import { Test, TestingModule } from '@nestjs/testing';
import { FormController } from './form.controller';
import { FormService } from 'src/services/form.service';

describe('FormController', () => {
  let controller: FormController;
  let mockFormService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockFormService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormController],
      providers: [
        {
          provide: FormService,
          useValue: mockFormService,
        },
      ],
    }).compile();

    controller = module.get<FormController>(FormController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a form', async () => {
    // Arrange: Preparar los datos de entrada (DTO)
    const createFormDto = {
      title: 'Test Form',
      tag: 'test-tag',
      category_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174000'
      ],
      inputs: [
        {
          inputType: 'text',
          label: 'Test Input',
          placeholder: 'Enter text',
          required: true
        },
        {
          inputType: 'select',
          label: 'Select Option',
          required: false,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
      ]
    };

    // Preparar la respuesta esperada del servicio
    const expectedForm = {
      id: '323e4567-e89b-12d3-a456-426614174000',
      title: 'Test Form',
      tag: 'test-tag',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockFormService.create.mockResolvedValue(expectedForm);

    // Act: Ejecutar el método del controlador
    const result = await controller.create(createFormDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFormService.create).toHaveBeenCalledWith(createFormDto);
    expect(mockFormService.create).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedForm);
  });

  it('should find all forms', async () => {
    // Arrange: Preparar los filtros opcionales
    const filters = {
      category_ids: '123e4567-e89b-12d3-a456-426614174000,223e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedForms = [
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        title: 'Test Form 1',
        tag: 'test-tag-1',
        created_at: new Date(),
        updated_at: new Date(),
        version: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          version_number: 1,
          inputs: [],
          is_active: true
        }
      },
      {
        id: '523e4567-e89b-12d3-a456-426614174000',
        title: 'Test Form 2',
        tag: 'test-tag-2',
        created_at: new Date(),
        updated_at: new Date(),
        version: {
          id: '623e4567-e89b-12d3-a456-426614174000',
          version_number: 1,
          inputs: [],
          is_active: true
        }
      }
    ];

    // Configurar el mock del servicio
    mockFormService.findAll.mockResolvedValue(expectedForms);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll(filters);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFormService.findAll).toHaveBeenCalledWith(filters);
    expect(mockFormService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedForms);
    expect(result).toHaveLength(2);
  });

  it('should find all forms without filters', async () => {
    // Arrange: Sin filtros
    const expectedForms = [
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        title: 'Test Form',
        tag: 'test-tag',
        created_at: new Date(),
        updated_at: new Date(),
        version: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          version_number: 1,
          inputs: [],
          is_active: true
        }
      }
    ];

    // Configurar el mock del servicio
    mockFormService.findAll.mockResolvedValue(expectedForms);

    // Act: Ejecutar el método del controlador sin filtros
    const result = await controller.findAll({});

    // Assert: Verificar que el servicio fue llamado con el objeto vacío
    expect(mockFormService.findAll).toHaveBeenCalledWith({});
    expect(mockFormService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedForms);
  });

  it('should find one form by id', async () => {
    // Arrange: Preparar el ID del formulario
    const formId = '323e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedForm = {
      id: formId,
      title: 'Test Form',
      tag: 'test-tag',
      created_at: new Date(),
      updated_at: new Date(),
      version: {
        id: '423e4567-e89b-12d3-a456-426614174000',
        version_number: 1,
        inputs: [
          {
            inputType: 'text',
            label: 'Test Input',
            placeholder: 'Enter text',
            required: true
          }
        ],
        is_active: true
      }
    };

    // Configurar el mock del servicio
    mockFormService.findOne.mockResolvedValue(expectedForm);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(formId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFormService.findOne).toHaveBeenCalledWith(formId);
    expect(mockFormService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedForm);
    expect(result.id).toBe(formId);
  });

  it('should update a form', async () => {
    // Arrange: Preparar el ID y los datos de actualización
    const formId = '323e4567-e89b-12d3-a456-426614174000';
    const updateFormDto = {
      title: 'Updated Form Title',
      tag: 'updated-tag'
    };

    // Preparar la respuesta esperada del servicio
    const expectedForm = {
      id: formId,
      title: 'Updated Form Title',
      tag: 'updated-tag',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockFormService.update.mockResolvedValue(expectedForm);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(formId, updateFormDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFormService.update).toHaveBeenCalledWith(formId, updateFormDto);
    expect(mockFormService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedForm);
    expect(result.id).toBe(formId);
    expect(result.title).toBe('Updated Form Title');
    expect(result.tag).toBe('updated-tag');
  });

  it('should remove a form', async () => {
    // Arrange: Preparar el ID del formulario
    const formId = '323e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedResponse = {
      message: `Form with ID: (${formId}) has deleted successfully!`
    };

    // Configurar el mock del servicio
    mockFormService.remove.mockResolvedValue(expectedResponse);

    // Act: Ejecutar el método del controlador
    const result = await controller.remove(formId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFormService.remove).toHaveBeenCalledWith(formId);
    expect(mockFormService.remove).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedResponse);
    expect(result.message).toContain(formId);
  });
});
