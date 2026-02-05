import { Test, TestingModule } from '@nestjs/testing';
import { LogController } from './log.controller';
import { LogService } from 'src/services/log.service';

describe('LogController', () => {
  let controller: LogController;
  let mockLogService: {
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    mockLogService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogController],
      providers: [
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    }).compile();

    controller = module.get<LogController>(LogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all logs', async () => {
    // Arrange: Preparar la respuesta esperada del servicio
    const expectedLogs = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        action: 'CREATE',
        resource_type: 'category',
        resource_id: '223e4567-e89b-12d3-a456-426614174000',
        user_id: '323e4567-e89b-12d3-a456-426614174000',
        details: { name: 'Test Category' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: new Date()
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174000',
        action: 'UPDATE',
        resource_type: 'form',
        resource_id: '523e4567-e89b-12d3-a456-426614174000',
        user_id: '323e4567-e89b-12d3-a456-426614174000',
        details: { title: 'Updated Form' },
        ip_address: '192.168.1.2',
        user_agent: 'Mozilla/5.0',
        created_at: new Date()
      },
      {
        id: '623e4567-e89b-12d3-a456-426614174000',
        action: 'DELETE',
        resource_type: 'shape',
        resource_id: '723e4567-e89b-12d3-a456-426614174000',
        user_id: null,
        details: null,
        ip_address: '192.168.1.3',
        user_agent: null,
        created_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockLogService.findAll.mockResolvedValue(expectedLogs);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll();

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockLogService.findAll).toHaveBeenCalledTimes(1);
    expect(mockLogService.findAll).toHaveBeenCalledWith();

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedLogs);
    expect(result).toHaveLength(3);
    
    // Verificar que los logs tienen la estructura correcta
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('action');
    expect(result[0]).toHaveProperty('resource_type');
    expect(result[0]).toHaveProperty('created_at');
  });

  it('should return empty array when no logs exist', async () => {
    // Arrange: Preparar respuesta vacía
    const expectedLogs: any[] = [];

    // Configurar el mock del servicio
    mockLogService.findAll.mockResolvedValue(expectedLogs);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll();

    // Assert: Verificar que el servicio fue llamado
    expect(mockLogService.findAll).toHaveBeenCalledTimes(1);
    expect(mockLogService.findAll).toHaveBeenCalledWith();

    // Verificar que el resultado es un array vacío
    expect(result).toBeDefined();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
