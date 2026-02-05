import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: {
    findByUsername: jest.Mock;
    findByEmail: jest.Mock;
    comparePassword: jest.Mock;
  };
  let mockJwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    mockUsersService = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      comparePassword: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully with username', async () => {
      // Arrange
      const loginDto = {
        username: 'johndoe',
        password: 'password123'
      };

      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fullname: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        role: 'ADMIN_USER',
        institution_id: '223e4567-e89b-12d3-a456-426614174000'
      };

      const accessToken = 'jwt-token-123';

      mockUsersService.findByUsername.mockResolvedValue(user);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
      expect(mockUsersService.comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id
      });
      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          role: user.role,
          institution_id: user.institution_id
        }
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should login successfully with email when username not found', async () => {
      // Arrange
      const loginDto = {
        username: 'john.doe@example.com',
        password: 'password123'
      };

      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fullname: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        role: 'ADMIN_USER',
        institution_id: null
      };

      const accessToken = 'jwt-token-123';

      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('john.doe@example.com');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(mockUsersService.comparePassword).toHaveBeenCalled();
      expect(result.access_token).toBe(accessToken);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const loginDto = {
        username: 'nonexistent',
        password: 'password123'
      };

      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const loginDto = {
        username: 'johndoe',
        password: 'wrongPassword'
      };

      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        password: 'hashedPassword',
        email: 'john.doe@example.com',
        role: 'ADMIN_USER'
      };

      mockUsersService.findByUsername.mockResolvedValue(user);
      mockUsersService.comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciales inválidas');
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('findUser', () => {
    it('should find user by username', async () => {
      // Arrange
      const username = 'johndoe';
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        email: 'john.doe@example.com'
      };

      mockUsersService.findByUsername.mockResolvedValue(user);

      // Act
      const result = await service.findUser(username);

      // Assert
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith(username);
      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should find user by email when username not found', async () => {
      // Arrange
      const email = 'john.doe@example.com';
      const user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        email: 'john.doe@example.com'
      };

      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(user);

      // Act
      const result = await service.findUser(email);

      // Assert
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith(email);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const username = 'nonexistent';

      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act
      const result = await service.findUser(username);

      // Assert
      expect(result).toBeNull();
    });
  });
});
