import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'src/database/model.config';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserFilters } from 'src/dto/filters.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PgService } from 'src/database/pg-config.service';
import { User } from 'src/entities/user.entity';
import { UUID } from 'src/helpers/uuid';
import bcrypt from 'bcrypt';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class UsersService {
  private _userModel: UserModel;

  constructor(private readonly db: PgService) {
    this._userModel = new UserModel(this.db);
  }

  private excludePassword(user: any) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this._userModel.create({
      id: UUID.create().getValue(),
      fullname: createUserDto.fullname,
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      role: createUserDto.role,
      institution_id: createUserDto.institution_id ? UUID.fromString(createUserDto.institution_id).getValue() : null
    });
    return this.excludePassword(user);
  }

  async findAll(filters: UserFilters = { page: 1, limit: 10 }) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (filters.searchTerm && filters.searchTerm !== '') {
      where.fullname = { ilike: `%${filters.searchTerm}%` };
    }

    const result = await this._userModel.findAndCountAll({ where, include: ['institution'], limit, offset });

    const total = result.count || 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const data = (result.rows || []).map((user: any) => this.excludePassword(user));

    return {
      data,
      metadata: {
        page,
        totalPages,
        hasNext,
        hasPrevious,
        total
      }
    };
  }

  async findOne(id: string) {
    const userId = UUID.fromString(id);
    const user = await this._userModel.findOne({ 
      where: { id: userId.getValue() },
      include: ['institution']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return this.excludePassword(user);
  }

  async findByUsername(username: string) {
    const user = await this._userModel.findOne({ 
      where: { username },
      include: ['institution']
    });
    return user || null;
  }

  async findByEmail(email: string) {
    const user = await this._userModel.findOne({ 
      where: { email },
      include: ['institution']
    });
    return user || null;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userId = UUID.fromString(id);

    const updateData: Partial<User> = {};

    if (updateUserDto.fullname) {
      updateData.fullname = updateUserDto.fullname;
    }

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.username) {
      updateData.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      updateData.password = await this.hashPassword(updateUserDto.password);
    }

    if (updateUserDto.role) {
      updateData.role = updateUserDto.role;
    }

    if (updateUserDto.institution_id) {
      updateData.institution_id = UUID.fromString(updateUserDto.institution_id).getValue() 
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    const updatedUser = await this._userModel.update(updateData, { 
      where: { id: userId.getValue() } 
    });

    if (!updatedUser) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return this.excludePassword(updatedUser);
  }

  async remove(id: string) {
    const userId = UUID.fromString(id);
    const user = await this._userModel.delete({ 
      where: { id: userId.getValue() } 
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return this.excludePassword(user);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(text: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(text, hashedPassword);
  }
}
