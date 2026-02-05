import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PgService } from 'src/database/pg-config.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockPgService: {
    runInTransaction: jest.Mock;
    query: jest.Mock;
  };
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      query: jest.fn(),
    };

    mockPgService = {
      runInTransaction: jest.fn((callback) => callback(mockClient)),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully and exclude password', async () => {
      // Arrange
      const createUserDto = {
        fullname: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'ADMIN_USER',
        institution_id: '123e4567-e89b-12d3-a456-426614174000'
      };

      const hashedPassword = 'hashedPassword123';
      const userWithPassword = {
        id: '223e4567-e89b-12d3-a456-426614174000',
        fullname: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'ADMIN_USER',
        institution_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: new Date(),
        updated_at: new Date()
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockClient.query.mockResolvedValueOnce({
        rows: [userWithPassword],
        rowCount: 1
      });

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(userWithPassword.id);
      expect(result.fullname).toBe('John Doe');
    });

    it('should create a user without institution_id', async () => {
      // Arrange
      const createUserDto = {
        fullname: 'Jane Smith',
        username: 'janesmith',
        email: 'jane.smith@example.com',
        password: 'password456',
        role: 'OPERATOR_USER'
      };

      const hashedPassword = 'hashedPassword456';
      const userWithPassword = {
        id: '323e4567-e89b-12d3-a456-426614174000',
        fullname: 'Jane Smith',
        username: 'janesmith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        role: 'OPERATOR_USER',
        institution_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockClient.query.mockResolvedValueOnce({
        rows: [userWithPassword],
        rowCount: 1
      });

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result.institution_id).toBeNull();
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should find all users without passwords', async () => {
      // Arrange
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
        }
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: expectedUsers,
        rowCount: 1
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUsers);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
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

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedUser],
        rowCount: 1
      });

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.findOne(userId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Usuario con id ${userId} no encontrado`);
      }
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      // Arrange
      const username = 'johndoe';
      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        password: 'hashedPassword',
        email: 'john.doe@example.com',
        role: 'ADMIN_USER'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedUser],
        rowCount: 1
      });

      // Act
      const result = await service.findByUsername(username);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const username = 'nonexistent';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await service.findByUsername(username);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // Arrange
      const email = 'john.doe@example.com';
      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        role: 'ADMIN_USER'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [expectedUser],
        rowCount: 1
      });

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto = {
        fullname: 'John Updated Doe',
        email: 'john.updated@example.com'
      };

      const updatedUser = {
        id: userId,
        fullname: 'John Updated Doe',
        email: 'john.updated@example.com',
        username: 'johndoe',
        role: 'ADMIN_USER',
        institution_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [updatedUser], rowCount: 1 }); // UPDATE user

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1); // SELECT + UPDATE
      // Comparar sin fechas porque pueden diferir ligeramente
      expect(result.id).toBe(updatedUser.id);
      expect(result.fullname).toBe(updatedUser.fullname);
      expect(result.email).toBe(updatedUser.email);
    });

    it('should update password and hash it', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto = {
        password: 'newPassword123'
      };

      const currentUser = {
        id: userId,
        fullname: 'John Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'oldHashedPassword',
        role: 'ADMIN_USER'
      };

      const hashedPassword = 'newHashedPassword';
      const updatedUser = {
        id: userId,
        fullname: 'John Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        role: 'ADMIN_USER',
        created_at: new Date(),
        updated_at: new Date()
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockClient.query
        .mockResolvedValueOnce({ rows: [updatedUser], rowCount: 1 }); // UPDATE user

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockClient.query).toHaveBeenCalledTimes(1); // SELECT + UPDATE
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto = {
        fullname: 'Updated Name'
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.update(userId, updateUserDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Usuario con id ${userId} no encontrado`);
      }
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const deletedUser = {
        id: userId,
        fullname: 'John Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        role: 'ADMIN_USER',
        institution_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [deletedUser],
        rowCount: 1
      });

      // Act
      const result = await service.remove(userId);

      // Assert
      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deletedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      try {
        await service.remove(userId);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Usuario con id ${userId} no encontrado`);
      }
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Act
      const result = await service.hashPassword(password);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should compare password correctly', async () => {
      // Arrange
      const text = 'testPassword123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.comparePassword(text, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(text, hashedPassword);
      expect(result).toBe(true);
    });
  });
});
