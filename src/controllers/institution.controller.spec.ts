import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from 'src/services/institution.service';

describe('InstitutionController', () => {
  let controller: InstitutionController;
  let mockInstitutionService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockInstitutionService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionController],
      providers: [
        {
          provide: InstitutionService,
          useValue: mockInstitutionService,
        },
      ],
    }).compile();

    controller = module.get<InstitutionController>(InstitutionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an institution', async () => {
    // Arrange: Preparar los datos de entrada (DTO)
    const createInstitutionDto = {
      code: 'INST001',
      name: 'Test Institution'
    };

    // Preparar la respuesta esperada del servicio
    const expectedInstitution = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      code: 'INST001',
      name: 'Test Institution',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockInstitutionService.create.mockResolvedValue(expectedInstitution);

    // Act: Ejecutar el método del controlador
    const result = await controller.create(createInstitutionDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockInstitutionService.create).toHaveBeenCalledWith(createInstitutionDto);
    expect(mockInstitutionService.create).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedInstitution);
    expect(result.code).toBe('INST001');
    expect(result.name).toBe('Test Institution');
  });

  it('should find all institutions', async () => {
    // Arrange: Preparar la respuesta esperada del servicio
    const expectedInstitutions = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        code: 'INST001',
        name: 'Institution A',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        code: 'INST002',
        name: 'Institution B',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        code: 'INST003',
        name: 'Institution C',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockInstitutionService.findAll.mockResolvedValue(expectedInstitutions);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll();

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockInstitutionService.findAll).toHaveBeenCalledTimes(1);
    expect(mockInstitutionService.findAll).toHaveBeenCalledWith();

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedInstitutions);
    expect(result).toHaveLength(3);
    // Verificar que están ordenados por nombre
    expect(result[0].name).toBe('Institution A');
    expect(result[1].name).toBe('Institution B');
    expect(result[2].name).toBe('Institution C');
  });

  it('should find one institution by id', async () => {
    // Arrange: Preparar el ID de la institución
    const institutionId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedInstitution = {
      id: institutionId,
      code: 'INST001',
      name: 'Test Institution',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockInstitutionService.findOne.mockResolvedValue(expectedInstitution);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(institutionId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockInstitutionService.findOne).toHaveBeenCalledWith(institutionId);
    expect(mockInstitutionService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedInstitution);
    expect(result.id).toBe(institutionId);
    expect(result.code).toBe('INST001');
    expect(result.name).toBe('Test Institution');
  });

  it('should update an institution', async () => {
    // Arrange: Preparar el ID y los datos de actualización
    const institutionId = '123e4567-e89b-12d3-a456-426614174000';
    const updateInstitutionDto = {
      name: 'Updated Institution Name',
      code: 'INST001-UPDATED'
    };

    // Preparar la respuesta esperada del servicio
    const expectedInstitution = {
      id: institutionId,
      code: 'INST001-UPDATED',
      name: 'Updated Institution Name',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockInstitutionService.update.mockResolvedValue(expectedInstitution);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(institutionId, updateInstitutionDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockInstitutionService.update).toHaveBeenCalledWith(institutionId, updateInstitutionDto);
    expect(mockInstitutionService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedInstitution);
    expect(result.id).toBe(institutionId);
    expect(result.name).toBe('Updated Institution Name');
    expect(result.code).toBe('INST001-UPDATED');
  });

  it('should update an institution with partial data', async () => {
    // Arrange: Preparar el ID y solo algunos datos de actualización
    const institutionId = '123e4567-e89b-12d3-a456-426614174000';
    const updateInstitutionDto = {
      name: 'Updated Institution Name Only'
    };

    // Preparar la respuesta esperada del servicio
    const expectedInstitution = {
      id: institutionId,
      code: 'INST001', // Código original se mantiene
      name: 'Updated Institution Name Only',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockInstitutionService.update.mockResolvedValue(expectedInstitution);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(institutionId, updateInstitutionDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockInstitutionService.update).toHaveBeenCalledWith(institutionId, updateInstitutionDto);
    expect(mockInstitutionService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedInstitution);
    expect(result.id).toBe(institutionId);
    expect(result.name).toBe('Updated Institution Name Only');
  });

  it('should remove an institution', async () => {
    // Arrange: Preparar el ID de la institución
    const institutionId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedResponse = {
      message: `Institución con ID: (${institutionId}) ha sido eliminada exitosamente!`
    };

    // Configurar el mock del servicio
    mockInstitutionService.remove.mockResolvedValue(expectedResponse);

    // Act: Ejecutar el método del controlador
    const result = await controller.remove(institutionId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockInstitutionService.remove).toHaveBeenCalledWith(institutionId);
    expect(mockInstitutionService.remove).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedResponse);
    expect(result.message).toContain(institutionId);
  });
});
