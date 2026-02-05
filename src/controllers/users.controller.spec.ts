import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from 'src/services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    // Arrange: Preparar los datos de entrada (DTO)
    const createUserDto = {
      fullname: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'ADMIN_USER',
      institution_id: '123e4567-e89b-12d3-a456-426614174000'
    };

    // Preparar la respuesta esperada del servicio (sin password)
    const expectedUser = {
      id: '223e4567-e89b-12d3-a456-426614174000',
      fullname: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      role: 'ADMIN_USER',
      institution_id: '123e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockUsersService.create.mockResolvedValue(expectedUser);

    // Act: Ejecutar el método del controlador
    const result = await controller.create(createUserDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    expect(mockUsersService.create).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedUser);
    expect(result.fullname).toBe('John Doe');
    expect(result.username).toBe('johndoe');
    expect(result.email).toBe('john.doe@example.com');
    expect(result.role).toBe('ADMIN_USER');
    // Verificar que no se incluye el password en la respuesta
    expect(result).not.toHaveProperty('password');
  });

  it('should create a user without institution_id', async () => {
    // Arrange: Preparar los datos de entrada sin institution_id
    const createUserDto = {
      fullname: 'Jane Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      password: 'password456',
      role: 'OPERATOR_USER'
    };

    // Preparar la respuesta esperada del servicio
    const expectedUser = {
      id: '323e4567-e89b-12d3-a456-426614174000',
      fullname: 'Jane Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      role: 'OPERATOR_USER',
      institution_id: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockUsersService.create.mockResolvedValue(expectedUser);

    // Act: Ejecutar el método del controlador
    const result = await controller.create(createUserDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    expect(mockUsersService.create).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedUser);
    expect(result.institution_id).toBeNull();
  });

  it('should find all users', async () => {
    // Arrange: Preparar la respuesta esperada del servicio
    const expectedUsers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fullname: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        role: 'ADMIN_USER',
        institution_id: '223e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174000',
        fullname: 'Jane Smith',
        username: 'janesmith',
        email: 'jane.smith@example.com',
        role: 'OPERATOR_USER',
        institution_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174000',
        fullname: 'Bob Johnson',
        username: 'bobjohnson',
        email: 'bob.johnson@example.com',
        role: 'SUPER_ADMIN',
        institution_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Configurar el mock del servicio
    mockUsersService.findAll.mockResolvedValue(expectedUsers);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll();

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findAll).toHaveBeenCalledWith();

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedUsers);
    expect(result).toHaveLength(3);
    
    // Verificar que los usuarios tienen la estructura correcta y no incluyen password
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('fullname');
    expect(result[0]).toHaveProperty('username');
    expect(result[0]).toHaveProperty('email');
    expect(result[0]).toHaveProperty('role');
    expect(result[0]).not.toHaveProperty('password');
  });

  it('should return empty array when no users exist', async () => {
    // Arrange: Preparar respuesta vacía
    const expectedUsers: any[] = [];

    // Configurar el mock del servicio
    mockUsersService.findAll.mockResolvedValue(expectedUsers);

    // Act: Ejecutar el método del controlador
    const result = await controller.findAll();

    // Assert: Verificar que el servicio fue llamado
    expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    expect(mockUsersService.findAll).toHaveBeenCalledWith();

    // Verificar que el resultado es un array vacío
    expect(result).toBeDefined();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should find one user by id', async () => {
    // Arrange: Preparar el ID del usuario
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedUser = {
      id: userId,
      fullname: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      role: 'ADMIN_USER',
      institution_id: '223e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockUsersService.findOne.mockResolvedValue(expectedUser);

    // Act: Ejecutar el método del controlador
    const result = await controller.findOne(userId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    expect(mockUsersService.findOne).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedUser);
    expect(result.id).toBe(userId);
    expect(result.fullname).toBe('John Doe');
    expect(result.username).toBe('johndoe');
    expect(result.email).toBe('john.doe@example.com');
    expect(result.role).toBe('ADMIN_USER');
    // Verificar que no se incluye el password
    expect(result).not.toHaveProperty('password');
  });

  it('should update a user', async () => {
    // Arrange: Preparar el ID y los datos de actualización
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const updateUserDto = {
      fullname: 'John Updated Doe',
      email: 'john.updated@example.com',
      role: 'SUPER_ADMIN'
    };

    // Preparar la respuesta esperada del servicio
    const expectedUser = {
      id: userId,
      fullname: 'John Updated Doe',
      username: 'johndoe',
      email: 'john.updated@example.com',
      role: 'SUPER_ADMIN',
      institution_id: '223e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockUsersService.update.mockResolvedValue(expectedUser);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(userId, updateUserDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    expect(mockUsersService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedUser);
    expect(result.id).toBe(userId);
    expect(result.fullname).toBe('John Updated Doe');
    expect(result.email).toBe('john.updated@example.com');
    expect(result.role).toBe('SUPER_ADMIN');
    // Verificar que no se incluye el password
    expect(result).not.toHaveProperty('password');
  });

  it('should update a user with partial data', async () => {
    // Arrange: Preparar el ID y solo algunos datos de actualización
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const updateUserDto = {
      fullname: 'John Updated Doe'
    };

    // Preparar la respuesta esperada del servicio
    const expectedUser = {
      id: userId,
      fullname: 'John Updated Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      role: 'ADMIN_USER',
      institution_id: '223e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockUsersService.update.mockResolvedValue(expectedUser);

    // Act: Ejecutar el método del controlador
    const result = await controller.update(userId, updateUserDto);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    expect(mockUsersService.update).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedUser);
    expect(result.id).toBe(userId);
    expect(result.fullname).toBe('John Updated Doe');
  });

  it('should remove a user', async () => {
    // Arrange: Preparar el ID del usuario
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    // Preparar la respuesta esperada del servicio
    const expectedUser = {
      id: userId,
      fullname: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      role: 'ADMIN_USER',
      institution_id: '223e4567-e89b-12d3-a456-426614174000',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Configurar el mock del servicio
    mockUsersService.remove.mockResolvedValue(expectedUser);

    // Act: Ejecutar el método del controlador
    const result = await controller.remove(userId);

    // Assert: Verificar que el servicio fue llamado correctamente
    expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    expect(mockUsersService.remove).toHaveBeenCalledTimes(1);

    // Verificar que el resultado es el esperado
    expect(result).toBeDefined();
    expect(result).toEqual(expectedUser);
    expect(result.id).toBe(userId);
    // Verificar que no se incluye el password
    expect(result).not.toHaveProperty('password');
  });
});
