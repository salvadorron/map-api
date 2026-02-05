import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    login: jest.Mock;
  };

  beforeEach(async () => {
    // Definimos el mock del servicio siguiendo tu patrón
    mockAuthService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should authenticate user and return access token with metadata', async () => {
    // Arrange: Datos de entrada según tu LoginDto
    const loginDto = {
      username: 'admin_guarico',
      password: 'securePassword123',
    };

    // Respuesta esperada: JWT + Metadatos institucionales
    const expectedResponse = {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'user-001',
        username: 'admin_guarico',
        role: 'admin',
        institution: 'Gobernación de Guárico' // Metadatos que mencionaste
      }
    };

    // Configuramos el mock
    mockAuthService.login.mockResolvedValue(expectedResponse);

    // Act: Ejecutamos el login
    const result = await controller.login(loginDto);

    // Assert: Verificaciones
    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    
    expect(result).toBeDefined();
    expect(result.access_token).toBeDefined();
    expect(result.user.username).toEqual(loginDto.username);
    expect(result).toEqual(expectedResponse);
  });
});