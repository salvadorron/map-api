import { Test, TestingModule } from '@nestjs/testing';
import { ParrishController } from './parrish.controller';
import { ParrishService } from 'src/services/parrish.service';

describe('ParrishController', () => {
  let controller: ParrishController;
  let mockParrishService: {
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    mockParrishService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParrishController],
      providers: [
        {
          provide: ParrishService,
          useValue: mockParrishService,
        },
      ],
    }).compile();

    controller = module.get<ParrishController>(ParrishController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all parrishes', async () => {
    // Arrange: Preparar la respuesta esperada del servicio
    const expectedParrishes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Parrish A',
        code: '001',
        municipality_id: '223e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        name: 'Parrish B',
        code: '002',
        municipality_id: '223e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174000',
        name: 'Parrish C',
        code: '003',
        municipality_id: '523e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockParrishService.findAll.mockResolvedValue(expectedParrishes);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll({});

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockParrishService.findAll).toHaveBeenCalledTimes(1);
    expect(mockParrishService.findAll).toHaveBeenCalledWith({});

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedParrishes);
    expect(result).toHaveLength(3);
    
    // Verificar que las parroquias tienen la estructura correcta
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('code');
    expect(result[0]).toHaveProperty('municipality_id');
  });

  it('should find all parrishes with municipality filter', async () => {
    // Arrange: Preparar los filtros
    const filters = {
      municipalityIds: '223e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedParrishes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Parrish A',
        code: '001',
        municipality_id: '223e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        name: 'Parrish B',
        code: '002',
        municipality_id: '223e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockParrishService.findAll.mockResolvedValue(expectedParrishes);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll(filters);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockParrishService.findAll).toHaveBeenCalledWith(filters);
    expect(mockParrishService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedParrishes);
    expect(result).toHaveLength(2);
    // Verificar que todas las parroquias pertenecen al municipio filtrado
    expect(result.every(p => p.municipality_id === '223e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('should find all parrishes with multiple municipality filters', async () => {
    // Arrange: Preparar los filtros con múltiples municipios
    const filters = {
      municipalityIds: '223e4567-e89b-12d3-a456-426614174000,523e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedParrishes = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Parrish A',
        code: '001',
        municipality_id: '223e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174000',
        name: 'Parrish C',
        code: '003',
        municipality_id: '523e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockParrishService.findAll.mockResolvedValue(expectedParrishes);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll(filters);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockParrishService.findAll).toHaveBeenCalledWith(filters);
    expect(mockParrishService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedParrishes);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no parrishes exist', async () => {
    // Arrange: Preparar respuesta vacía
    const expectedParrishes: any[] = [];

    // Configurar el mock del servicio
    mockParrishService.findAll.mockResolvedValue(expectedParrishes);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll({});

    // Assert: Verificar que el servicio fue llamado
    expect(mockParrishService.findAll).toHaveBeenCalledTimes(1);
    expect(mockParrishService.findAll).toHaveBeenCalledWith({});

    // Verificar que el resultado es un array vacío
    expect(result).toBeDefined();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should find one parrish by id', async () => {
    // Arrange: Preparar el ID de la parroquia
    const parrishId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedParrish = {
      id: parrishId,
      name: 'Test Parrish',
      code: '001',
      municipality_id: '223e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockParrishService.findOne.mockResolvedValue(expectedParrish);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(parrishId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockParrishService.findOne).toHaveBeenCalledWith(parrishId);
    expect(mockParrishService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedParrish);
    expect(result.id).toBe(parrishId);
    expect(result.name).toBe('Test Parrish');
    expect(result.code).toBe('001');
    expect(result.municipality_id).toBe('223e4567-e89b-12d3-a456-426614174000');
  });
});
