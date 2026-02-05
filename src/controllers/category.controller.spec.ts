import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from 'src/services/category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let mockCategoryService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockCategoryService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a category', async () => {
    // Arrange: Preparar los datos de entrada (DTO)
    const createCategoryDto = {
      name: 'Test Category',
      color: '#000000',
      element_type: 'text',
      icon: 'test-icon',
      parent_id: '123e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedCategory = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Category',
      color: '#000000',
      element_type: 'text',
      icon: 'test-icon',
      parent_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio para que devuelva la categoría esperada
    mockCategoryService.create.mockResolvedValue(expectedCategory);

    // Act: Ejecutar el método del controlador
    const result = await controller.create(createCategoryDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockCategoryService.create).toHaveBeenCalledWith(createCategoryDto);
    expect(mockCategoryService.create).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedCategory);
  });

  it('should find all categories', async () => {
    // Arrange: Preparar los filtros opcionales
    const filters = {
      is_public: 'false',
      parent_ids: '123e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedCategories = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Category 1',
        color: '#000000',
        element_type: 'text',
        icon: 'icon-1',
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        name: 'Category 2',
        color: '#FFFFFF',
        element_type: 'button',
        icon: 'icon-2',
        parent_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockCategoryService.findAll.mockResolvedValue(expectedCategories);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll(filters);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockCategoryService.findAll).toHaveBeenCalledWith(filters);
    expect(mockCategoryService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedCategories);
    expect(result).toHaveLength(2);
  });

  it('should find all categories without filters', async () => {
    // Arrange: Sin filtros (usando valores por defecto)
    const expectedCategories = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Category 1',
        color: '#000000',
        element_type: 'text',
        icon: 'icon-1',
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockCategoryService.findAll.mockResolvedValue(expectedCategories);

    // Act: Ejecutar el método del controlador sin filtros
    const result = await controller.findAll({});

    // Assert: Verificar que el servicio fue llamado con el objeto vacío
    expect(mockCategoryService.findAll).toHaveBeenCalledWith({});
    expect(mockCategoryService.findAll).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedCategories);
  });

  it('should find one category by id', async () => {
    // Arrange: Preparar el ID de la categoría
    const categoryId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedCategory = {
      id: categoryId,
      name: 'Test Category',
      color: '#000000',
      element_type: 'text',
      icon: 'test-icon',
      parent_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockCategoryService.findOne.mockResolvedValue(expectedCategory);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(categoryId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockCategoryService.findOne).toHaveBeenCalledWith(categoryId);
    expect(mockCategoryService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedCategory);
    expect(result.id).toBe(categoryId);
  });

  it('should update a category', async () => {
    // Arrange: Preparar el ID y los datos de actualización
    const categoryId = '123e4567-e89b-12d3-a456-426614174000';
    const updateCategoryDto = {
      name: 'Updated Category Name',
      color: '#FF0000'
    };

    // Preparar la respuesta esperada del servicio
    const expectedCategory = {
      id: categoryId,
      name: 'Updated Category Name',
      color: '#FF0000',
      element_type: 'text',
      icon: 'test-icon',
      parent_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockCategoryService.update.mockResolvedValue(expectedCategory);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(categoryId, updateCategoryDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockCategoryService.update).toHaveBeenCalledWith(categoryId, updateCategoryDto);
    expect(mockCategoryService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedCategory);
    expect(result.id).toBe(categoryId);
    expect(result.name).toBe('Updated Category Name');
    expect(result.color).toBe('#FF0000');
  });

  it('should remove a category', async () => {
    // Arrange: Preparar el ID de la categoría
    const categoryId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedResponse = {
      message: `Category with ID: (${categoryId}) has deleted successfully!`
    };

    // Configurar el mock del servicio
    mockCategoryService.remove.mockResolvedValue(expectedResponse);

    // Act: Ejecutar el método del controlador
    const result = await controller.remove(categoryId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockCategoryService.remove).toHaveBeenCalledWith(categoryId);
    expect(mockCategoryService.remove).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedResponse);
    expect(result.message).toContain(categoryId);
  });

});
