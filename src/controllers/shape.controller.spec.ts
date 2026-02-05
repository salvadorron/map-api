import { Test, TestingModule } from '@nestjs/testing';
import { ShapeController } from './shape.controller';
import { ShapeService } from 'src/services/shape.service';
import { Geometry } from 'geojson';

describe('ShapeController', () => {
  let controller: ShapeController;
  let mockShapeService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockShapeService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShapeController],
      providers: [
        {
          provide: ShapeService,
          useValue: mockShapeService,
        },
      ],
    }).compile();

    controller = module.get<ShapeController>(ShapeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a shape', async () => {
    // Arrange: Preparar los datos de entrada (DTO)
    const createShapeDto = {
      category_ids: [
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174000'
      ],
      properties: {
        cod_mun: '001',
        cod_prq: '001',
        name: 'Test Shape'
      },
      status: 'PENDING',
      geom: {
        type: 'Point',
        coordinates: [-66.9, 10.5]
      } as Geometry,
      institution_id: '323e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio (GeoJSON Feature)
    const expectedShape = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-66.9, 10.5]
      },
      properties: {
        id: '423e4567-e89b-12d3-a456-426614174000',
        cod_mun: '001',
        cod_prq: '001',
        name: 'Test Shape',
        categories: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Category 1',
            icon: 'icon1',
            color: '#000000'
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174000',
            name: 'Category 2',
            icon: 'icon2',
            color: '#FFFFFF'
          }
        ],
        created_at: new Date(),
        updated_at: new Date()
      }
    };

    // Configurar el mock del servicio
    mockShapeService.create.mockResolvedValue(expectedShape);

    // Act: Ejecutar el método del controlador
    const result = await controller.create(createShapeDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockShapeService.create).toHaveBeenCalledWith(createShapeDto);
    expect(mockShapeService.create).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedShape);
    expect(result.type).toBe('Feature');
    expect(result.geometry).toBeDefined();
    expect(result.properties).toBeDefined();
    expect(result.properties.categories).toHaveLength(2);
  });

  it('should find all shapes', async () => {
    // Arrange: Preparar los filtros opcionales
    const filters = {
      status: 'APPROVED',
      municipality: '001',
      category: '123e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedShapes = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-66.9, 10.5]
        },
        properties: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          cod_mun: '001',
          cod_prq: '001',
          name: 'Shape 1',
          status: 'APPROVED',
          categories: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-66.9, 10.5], [-66.8, 10.5], [-66.8, 10.6], [-66.9, 10.6], [-66.9, 10.5]]]
        },
        properties: {
          id: '523e4567-e89b-12d3-a456-426614174000',
          cod_mun: '001',
          cod_prq: '002',
          name: 'Shape 2',
          status: 'APPROVED',
          categories: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      }
    ];

    // Configurar el mock del servicio
    mockShapeService.findAll.mockResolvedValue(expectedShapes);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll(filters);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockShapeService.findAll).toHaveBeenCalledWith(filters);
    expect(mockShapeService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedShapes);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('Feature');
    expect(result[1].type).toBe('Feature');
  });

  it('should find all shapes without filters', async () => {
    // Arrange: Sin filtros
    const expectedShapes = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-66.9, 10.5]
        },
        properties: {
          id: '423e4567-e89b-12d3-a456-426614174000',
          cod_mun: '001',
          status: 'APPROVED',
          categories: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      }
    ];

    // Configurar el mock del servicio
    mockShapeService.findAll.mockResolvedValue(expectedShapes);

    // Act: Ejecutar el método del controlador sin filtros
    const result = await controller.findAll({});

    // Assert: Verificar que el servicio fue llamado con el objeto vacío
    expect(mockShapeService.findAll).toHaveBeenCalledWith({});
    expect(mockShapeService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedShapes);
  });

  it('should find one shape by id', async () => {
    // Arrange: Preparar el ID del shape
    const shapeId = '423e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedShape = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-66.9, 10.5]
      },
      properties: {
        id: shapeId,
        cod_mun: '001',
        cod_prq: '001',
        name: 'Test Shape',
        status: 'APPROVED',
        categories: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Category 1',
            icon: 'icon1',
            color: '#000000'
          }
        ],
        created_at: new Date(),
        updated_at: new Date()
      }
    };

    // Configurar el mock del servicio
    mockShapeService.findOne.mockResolvedValue(expectedShape);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(shapeId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockShapeService.findOne).toHaveBeenCalledWith(shapeId);
    expect(mockShapeService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedShape);
    expect(result.type).toBe('Feature');
    expect(result.properties.id).toBe(shapeId);
    expect(result.properties.categories).toHaveLength(1);
  });

  it('should update a shape', async () => {
    // Arrange: Preparar el ID y los datos de actualización
    const shapeId = '423e4567-e89b-12d3-a456-426614174000';
    const updateShapeDto = {
      status: 'APPROVED',
      properties: {
        name: 'Updated Shape Name',
        cod_mun: '002'
      },
      category_ids: ['323e4567-e89b-12d3-a456-426614174000']
    };

    // Preparar la respuesta esperada del servicio
    const expectedShape = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-66.9, 10.5]
      },
      properties: {
        id: shapeId,
        name: 'Updated Shape Name',
        cod_mun: '002',
        status: 'APPROVED',
        categories: [
          {
            id: '323e4567-e89b-12d3-a456-426614174000',
            name: 'Updated Category',
            icon: 'icon3',
            color: '#FF0000'
          }
        ],
        created_at: new Date(),
        updated_at: new Date()
      }
    };

    // Configurar el mock del servicio
    mockShapeService.update.mockResolvedValue(expectedShape);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(shapeId, updateShapeDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockShapeService.update).toHaveBeenCalledWith(shapeId, updateShapeDto);
    expect(mockShapeService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedShape);
    expect(result.type).toBe('Feature');
    expect(result.properties.id).toBe(shapeId);
    expect(result.properties.status).toBe('APPROVED');
  });

  it('should remove a shape', async () => {
    // Arrange: Preparar el ID del shape
    const shapeId = '423e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedResponse = {
      message: `Shape with ID: (${shapeId}) has deleted successfully!`
    };

    // Configurar el mock del servicio
    mockShapeService.remove.mockResolvedValue(expectedResponse);

    // Act: Ejecutar el método del controlador
    const result = await controller.remove(shapeId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockShapeService.remove).toHaveBeenCalledWith(shapeId);
    expect(mockShapeService.remove).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedResponse);
    expect(result.message).toContain(shapeId);
  });
});
