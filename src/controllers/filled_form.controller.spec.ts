import { Test, TestingModule } from '@nestjs/testing';
import { FilledFormController } from './filled_form.controller';
import { FilledFormService } from 'src/services/filled_form.service';
import type { Response } from 'express';

describe('FilledFormController', () => {
  let controller: FilledFormController;
  let mockFilledFormService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    updateToLatestVersion: jest.Mock;
    remove: jest.Mock;
    generatePDFReport: jest.Mock;
  };

  beforeEach(async () => {
    mockFilledFormService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateToLatestVersion: jest.fn(),
      remove: jest.fn(),
      generatePDFReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilledFormController],
      providers: [
        {
          provide: FilledFormService,
          useValue: mockFilledFormService,
        },
      ],
    }).compile();

    controller = module.get<FilledFormController>(FilledFormController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a filled form', async () => {
    // Arrange: Preparar los datos de entrada (DTO)
    const createFilledFormDto = {
      form_id: '123e4567-e89b-12d3-a456-426614174000',
      shape_id: '223e4567-e89b-12d3-a456-426614174000',
      records: new Map([
        ['field1', { value: 'test value', label: 'Test Field', type: 'text' }]
      ]),
      title: 'Test Filled Form',
      user_id: '323e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedFilledForm = {
      id: '423e4567-e89b-12d3-a456-426614174000',
      form_id: '123e4567-e89b-12d3-a456-426614174000',
      form_version_id: '523e4567-e89b-12d3-a456-426614174000',
      shape_id: '223e4567-e89b-12d3-a456-426614174000',
      records: { field1: { value: 'test value', label: 'Test Field', type: 'text' } },
      title: 'Test Filled Form',
      user_id: '323e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockFilledFormService.create.mockResolvedValue(expectedFilledForm);

    // Act: Ejecutar el método del controlador
    const result = await controller.create(createFilledFormDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFilledFormService.create).toHaveBeenCalledWith(createFilledFormDto);
    expect(mockFilledFormService.create).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedFilledForm);
  });

  it('should find all filled forms', async () => {
    // Arrange: Preparar los filtros opcionales
    const filters = {
      shape_id: '223e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedFilledForms = [
      {
        id: '423e4567-e89b-12d3-a456-426614174000',
        form_id: '123e4567-e89b-12d3-a456-426614174000',
        form_version_id: '523e4567-e89b-12d3-a456-426614174000',
        shape_id: '223e4567-e89b-12d3-a456-426614174000',
        records: { field1: { value: 'test value', label: 'Test Field' } },
        title: 'Test Filled Form 1',
        user_id: '323e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '623e4567-e89b-12d3-a456-426614174000',
        form_id: '123e4567-e89b-12d3-a456-426614174000',
        form_version_id: '523e4567-e89b-12d3-a456-426614174000',
        shape_id: '223e4567-e89b-12d3-a456-426614174000',
        records: { field2: { value: 'another value', label: 'Another Field' } },
        title: 'Test Filled Form 2',
        user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockFilledFormService.findAll.mockResolvedValue(expectedFilledForms);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll(filters);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFilledFormService.findAll).toHaveBeenCalledWith(filters);
    expect(mockFilledFormService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedFilledForms);
    expect(result).toHaveLength(2);
  });

  it('should find all filled forms without filters', async () => {
    // Arrange: Sin filtros
    const expectedFilledForms = [
      {
        id: '423e4567-e89b-12d3-a456-426614174000',
        form_id: '123e4567-e89b-12d3-a456-426614174000',
        form_version_id: '523e4567-e89b-12d3-a456-426614174000',
        shape_id: '223e4567-e89b-12d3-a456-426614174000',
        records: { field1: { value: 'test value', label: 'Test Field' } },
        title: 'Test Filled Form',
        user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockFilledFormService.findAll.mockResolvedValue(expectedFilledForms);

    // Act: Ejecutar el método del controlador sin filtros
    const result = await controller.findAll({});

    // Assert: Verificar que el servicio fue llamado con el objeto vacío
    expect(mockFilledFormService.findAll).toHaveBeenCalledWith({});
    expect(mockFilledFormService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedFilledForms);
  });

  it('should find one filled form by id', async () => {
    // Arrange: Preparar el ID del filled form
    const filledFormId = '423e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedFilledForm = {
      id: filledFormId,
      form_version_id: '523e4567-e89b-12d3-a456-426614174000',
      shape_id: '223e4567-e89b-12d3-a456-426614174000',
      records: { field1: { value: 'test value', label: 'Test Field', type: 'text' } },
      title: 'Test Filled Form',
      user_id: '323e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockFilledFormService.findOne.mockResolvedValue(expectedFilledForm);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(filledFormId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFilledFormService.findOne).toHaveBeenCalledWith(filledFormId);
    expect(mockFilledFormService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedFilledForm);
    expect(result.id).toBe(filledFormId);
  });

  it('should update a filled form', async () => {
    // Arrange: Preparar el ID y los datos de actualización
    const filledFormId = '423e4567-e89b-12d3-a456-426614174000';
    const updateFilledFormDto = {
      title: 'Updated Filled Form Title',
      records: new Map([
        ['field1', { value: 'updated value', label: 'Updated Field', type: 'text' }]
      ])
    };

    // Preparar la respuesta esperada del servicio
    const expectedFilledForm = {
      id: filledFormId,
      form_version_id: '523e4567-e89b-12d3-a456-426614174000',
      shape_id: '223e4567-e89b-12d3-a456-426614174000',
      records: { field1: { value: 'updated value', label: 'Updated Field', type: 'text' } },
      title: 'Updated Filled Form Title',
      user_id: '323e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockFilledFormService.update.mockResolvedValue(expectedFilledForm);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(filledFormId, updateFilledFormDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFilledFormService.update).toHaveBeenCalledWith(filledFormId, updateFilledFormDto);
    expect(mockFilledFormService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedFilledForm);
    expect(result.id).toBe(filledFormId);
    expect(result.title).toBe('Updated Filled Form Title');
  });

  it('should update filled form to latest version', async () => {
    // Arrange: Preparar el ID del filled form
    const filledFormId = '423e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedFilledForm = {
      id: filledFormId,
      form_id: '123e4567-e89b-12d3-a456-426614174000',
      form_version_id: '723e4567-e89b-12d3-a456-426614174000', // Nueva versión
      shape_id: '223e4567-e89b-12d3-a456-426614174000',
      records: { field1: { value: 'test value', label: 'Test Field' } },
      title: 'Test Filled Form',
      user_id: '323e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockFilledFormService.updateToLatestVersion.mockResolvedValue(expectedFilledForm);

    // Act: Ejecutar el método del controlador
    const result = await controller.updateToLatestVersion(filledFormId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFilledFormService.updateToLatestVersion).toHaveBeenCalledWith(filledFormId);
    expect(mockFilledFormService.updateToLatestVersion).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedFilledForm);
    expect(result.id).toBe(filledFormId);
  });

  it('should remove a filled form', async () => {
    // Arrange: Preparar el ID del filled form
    const filledFormId = '423e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedResponse = {
      message: `Filled form with ID: (${filledFormId}) has deleted successfully!`
    };

    // Configurar el mock del servicio
    mockFilledFormService.remove.mockResolvedValue(expectedResponse);

    // Act: Ejecutar el método del controlador
    const result = await controller.remove(filledFormId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFilledFormService.remove).toHaveBeenCalledWith(filledFormId);
    expect(mockFilledFormService.remove).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedResponse);
    expect(result.message).toContain(filledFormId);
  });

  it('should generate PDF report successfully', async () => {
    // Arrange: Preparar el buffer del PDF
    const pdfBuffer = Buffer.from('PDF content here');

    // Mock del objeto Response de Express
    const mockResponse = {
      set: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    // Configurar el mock del servicio
    mockFilledFormService.generatePDFReport.mockResolvedValue(pdfBuffer);

    // Act: Ejecutar el método del controlador
    await controller.generatePDFReport(mockResponse);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockFilledFormService.generatePDFReport).toHaveBeenCalledTimes(1);

    // Verificar que se configuraron los headers correctamente
    expect(mockResponse.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': expect.stringContaining('attachment; filename="reporte-formularios-'),
      'Content-Length': pdfBuffer.length.toString(),
    });

    // Verificar que se envió el buffer
    expect(mockResponse.send).toHaveBeenCalledWith(pdfBuffer);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
  });

  it('should handle error when generating PDF report', async () => {
    // Arrange: Preparar el error
    const error = new Error('Error generating PDF');
    
    // Mock del objeto Response de Express
    const mockResponse = {
      set: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    // Configurar el mock del servicio para que lance un error
    mockFilledFormService.generatePDFReport.mockRejectedValue(error);

    // Act: Ejecutar el método del controlador
    await controller.generatePDFReport(mockResponse);

    // Assert: Verificar que el servicio fue llamado
    expect(mockFilledFormService.generatePDFReport).toHaveBeenCalledTimes(1);

    // Verificar que se envió una respuesta de error
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Error al generar el reporte PDF',
      error: error.message
    });
  });
});
