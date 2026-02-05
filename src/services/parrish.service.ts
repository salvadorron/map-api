import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'src/database/model.config';
import { PgService } from 'src/database/pg-config.service';
import { UUID } from 'src/helpers/uuid';
import { ParrishFilters } from 'src/dto/filters.dto';
import { Parrish } from 'src/entities/parrish.entity';
import { ParrishModel } from 'src/models/parrish.model';

@Injectable()
export class ParrishService {
  private _parrishModel: ParrishModel;

  constructor(private readonly db: PgService) {
    this._parrishModel = new ParrishModel(this.db);
  }

  async findAll(filters: ParrishFilters = {}) {
    const where: Record<string, any> = {};

    if (filters.municipalityIds && !filters.municipalityIds.includes('ALL')) {
      const ids = filters.municipalityIds.split(',').map(id => id.trim());
      where.municipality_id = { in: ids };
    }

    return this._parrishModel.findAll({ where });
  }

  async findOne(id: string) {
    const parrishId = UUID.fromString(id);
    const parrish = await this._parrishModel.findOne({ 
      where: { id: parrishId.getValue() } 
    });

    if (!parrish) {
      throw new NotFoundException(`Parrish with ID ${id} not found.`);
    }

    return parrish;
  }
}
