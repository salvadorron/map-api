import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { Role } from 'src/entities/role.entity';
import { UUID } from 'src/helpers/uuid';

@Injectable()
export class RoleService {
  constructor(readonly db: PgService) {}

  async create(createRoleDto: CreateRoleDto) {
    const roleId = UUID.create();
    const role = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Role>(
        'INSERT INTO public.roles (id, name) VALUES($1, $2) RETURNING *',
        [roleId.getValue(), createRoleDto.name]
      );
      return result.rows[0];
    });
    return role;
  }

  async findAll() {
    const roles = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Role>('SELECT * FROM public.roles ORDER BY name');
      return result.rows;
    });
    return roles;
  }

  async findOne(id: string) {
    const roleId = UUID.fromString(id);
    const role = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Role>('SELECT * FROM public.roles WHERE id = $1', [roleId.getValue()]);
      return result.rows[0];
    });
    if (!role) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    return role;
  }

  async findByName(name: string) {
    const role = await this.db.query(
      'SELECT * FROM public.roles WHERE name = $1',
      [name]
    );
    return role.rows[0] || null;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const roleId = UUID.fromString(id);
    const keys = Object.keys(updateRoleDto);
    const values = Object.values(updateRoleDto);

    if (keys.length === 0) {
      throw new BadRequestException('Debe haber al menos una propiedad para actualizar');
    }

    const role = await this.db.runInTransaction(async (client) => {
      const updates: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      keys.forEach(key => {
        updates.push(`"${key}" = $${paramIndex}`);
        updateValues.push(updateRoleDto[key]);
        paramIndex++;
      });

      updateValues.push(roleId.getValue());

      const query = `
        UPDATE public.roles
        SET ${updates.join(', ')}
        WHERE "id" = $${paramIndex}
        RETURNING *
      `;
      const result = await client.query<Role>(query, updateValues);
      if (result.rowCount === 0) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
      }
      return result.rows[0];
    });
    return role;
  }

  async remove(id: string) {
    const roleId = UUID.fromString(id);
    const deletedRole = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<Role, 'id'>>(
        'DELETE FROM public.roles WHERE id = $1 RETURNING id',
        [roleId.getValue()]
      );
      return result.rows[0];
    });
    if (!deletedRole) {
      throw new NotFoundException('Rol no encontrado');
    }
    return { message: `Rol con ID: (${deletedRole.id}) ha sido eliminado exitosamente!` };
  }
}
