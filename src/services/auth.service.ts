import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario por username o email
    const user = await this.findUser(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await this.usersService.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      institution_id: user.institution_id,
    };

    const access_token = this.jwtService.sign(payload);

    // Retornar respuesta sin contraseña
    return {
      access_token,
      user: {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        institution_id: user.institution_id,
      },
    };
  }

  async findUser(username: string){
    const userByUsername = await this.usersService.findByUsername(username);
    if(userByUsername) return userByUsername;
    const userByEmail = await this.usersService.findByEmail(username);
    if(userByEmail) return userByEmail;
    return null;
  }
}

