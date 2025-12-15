import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PgService } from 'src/database/pg-config.service';
import { UUID } from 'src/helpers/uuid';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(readonly db: PgService) {}

  private excludePassword(user: any) {
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.db.runInTransaction(async (client) => {
      const result = await client.query(
        'INSERT INTO public.users (id, fullname, email, username, password, role_id, institution_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          UUID.create().getValue(),
          createUserDto.fullname,
          createUserDto.email,
          createUserDto.username,
          hashedPassword,
          UUID.fromString(createUserDto.role_id).getValue(),
          createUserDto.institution_id ? UUID.fromString(createUserDto.institution_id).getValue() : null
        ]
      );
      return result.rows[0];
    });
    return this.excludePassword(user);
  }

  async findAll() {
    const users = await this.db.runInTransaction(async (client) => {
      const result = await client.query('SELECT id, fullname, email, username, role_id, institution_id, updated_at, created_at FROM public.users');
      return result.rows;
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.db.runInTransaction(async (client) => {
      const result = await client.query(
        'SELECT id, fullname, email, username, role_id, institution_id, updated_at, created_at FROM public.users WHERE id = $1',
        [UUID.fromString(id).getValue()]
      );
      return result.rows[0];
    });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.db.query(
      'SELECT * FROM public.users WHERE username = $1',
      [username]
    );
    return user.rows[0] || null;
  }

  async findByEmail(email: string) {
    const user = await this.db.query(
      'SELECT * FROM public.users WHERE email = $1',
      [email]
    );
    return user.rows[0] || null;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userId = UUID.fromString(id).getValue();
    
    // Obtener el usuario actual
    const currentUser = await this.db.query(
      'SELECT * FROM public.users WHERE id = $1',
      [userId]
    );

    if (!currentUser.rows[0]) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const user = await this.db.runInTransaction(async (client) => {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateUserDto.fullname !== undefined) {
        updates.push(`fullname = $${paramIndex}`);
        values.push(updateUserDto.fullname);
        paramIndex++;
      }

      if (updateUserDto.email !== undefined) {
        updates.push(`email = $${paramIndex}`);
        values.push(updateUserDto.email);
        paramIndex++;
      }

      if (updateUserDto.username !== undefined) {
        updates.push(`username = $${paramIndex}`);
        values.push(updateUserDto.username);
        paramIndex++;
      }

      if (updateUserDto.password !== undefined) {
        const hashedPassword = await this.hashPassword(updateUserDto.password);
        updates.push(`password = $${paramIndex}`);
        values.push(hashedPassword);
        paramIndex++;
      }

      if (updateUserDto.role_id !== undefined) {
        updates.push(`role_id = $${paramIndex}`);
        values.push(UUID.fromString(updateUserDto.role_id).getValue());
        paramIndex++;
      }

      if (updateUserDto.institution_id !== undefined) {
        updates.push(`institution_id = $${paramIndex}`);
        values.push(updateUserDto.institution_id ? UUID.fromString(updateUserDto.institution_id).getValue() : null);
        paramIndex++;
      }

      if (updates.length === 0) {
        return this.excludePassword(currentUser.rows[0]);
      }

      updates.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `UPDATE public.users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, fullname, email, username, role_id, institution_id, updated_at, created_at`;
      const result = await client.query(query, values);
      return result.rows[0];
    });
    return user;
  }

  async remove(id: string) {
    const user = await this.db.runInTransaction(async (client) => {
      const result = await client.query(
        'DELETE FROM public.users WHERE id = $1 RETURNING id, fullname, email, username, role_id, institution_id, updated_at, created_at',
        [UUID.fromString(id).getValue()]
      );
      return result.rows[0];
    });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(text: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(text, hashedPassword);
  }
}
