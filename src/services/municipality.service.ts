import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'src/database/model.config';
import { PgService } from 'src/database/pg-config.service';
import { Municipality } from 'src/entities/municipality.entity';
import { UUID } from 'src/helpers/uuid';
import { MunicipalityModel } from 'src/models/municipality.model';

@Injectable()
export class MunicipalityService {
  private _municipalityModel: MunicipalityModel;

  constructor(private readonly db: PgService) {
    this._municipalityModel = new MunicipalityModel(this.db);
  }

  findAll() {
    return this._municipalityModel.findAll({});
  }

  async findOne(id: string) {
    const municipalityId = UUID.fromString(id);
    const municipality = await this._municipalityModel.findOne({ 
      where: { id: municipalityId.getValue() } 
    });

    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${id} not found.`);
    }

    return municipality;
  }

}
