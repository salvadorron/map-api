import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalityController } from './municipality.controller';
import { MunicipalityService } from 'src/services/municipality.service';

describe('MunicipalityController', () => {
  let controller: MunicipalityController;
  let mockMunicipalityService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    mockMunicipalityService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MunicipalityController],
      providers: [
        {
          provide: MunicipalityService,
          useValue: mockMunicipalityService,
        },
      ],
    }).compile();

    controller = module.get<MunicipalityController>(MunicipalityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all municipalities', async () => {
    // Arrange: Preparar la respuesta esperada del servicio
    const expectedMunicipalities = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Municipality A',
        short_name: 'MUN-A',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Municipality B',
        short_name: 'MUN-B',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        name: 'Municipality C',
        short_name: 'MUN-C',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockMunicipalityService.findAll.mockResolvedValue(expectedMunicipalities);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll();

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockMunicipalityService.findAll).toHaveBeenCalledTimes(1);
    expect(mockMunicipalityService.findAll).toHaveBeenCalledWith();

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedMunicipalities);
    expect(result).toHaveLength(3);
    
    // Verificar que los municipios tienen la estructura correcta
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('short_name');
  });

  it('should return empty array when no municipalities exist', async () => {
    // Arrange: Preparar respuesta vacía
    const expectedMunicipalities: any[] = [];

    // Configurar el mock del servicio
    mockMunicipalityService.findAll.mockResolvedValue(expectedMunicipalities);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll();

    // Assert: Verificar que el servicio fue llamado
    expect(mockMunicipalityService.findAll).toHaveBeenCalledTimes(1);
    expect(mockMunicipalityService.findAll).toHaveBeenCalledWith();

    // Verificar que el resultado es un array vacío
    expect(result).toBeDefined();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should find one municipality by id', async () => {
    // Arrange: Preparar el ID del municipio
    const municipalityId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedMunicipality = {
      id: municipalityId,
      name: 'Test Municipality',
      short_name: 'MUN-TEST',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockMunicipalityService.findOne.mockResolvedValue(expectedMunicipality);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(municipalityId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockMunicipalityService.findOne).toHaveBeenCalledWith(municipalityId);
    expect(mockMunicipalityService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedMunicipality);
    expect(result.id).toBe(municipalityId);
    expect(result.name).toBe('Test Municipality');
    expect(result.short_name).toBe('MUN-TEST');
  });
});
