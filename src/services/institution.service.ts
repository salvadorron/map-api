import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'src/database/model.config';
import { PgService } from 'src/database/pg-config.service';
import { CreateInstitutionDto } from 'src/dto/create-institution.dto';
import { UpdateInstitutionDto } from 'src/dto/update-institution.dto';
import { Institution } from 'src/entities/institution.entity';
import { UUID } from 'src/helpers/uuid';
import { InstitutionModel } from 'src/models/institution.model';

@Injectable()
export class InstitutionService {
  private _institutionModel: InstitutionModel;

  constructor(private readonly db: PgService) {
    this._institutionModel = new InstitutionModel(this.db);
  }

  async create(createInstitutionDto: CreateInstitutionDto) {
    const institutionId = UUID.create();
    const institution = await this._institutionModel.create({
      id: institutionId.getValue(),
      code: createInstitutionDto.code,
      name: createInstitutionDto.name
    });
    return institution;
  }

  async findAll() {
    const institutions = await this._institutionModel.findAll();
    return institutions.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findOne(id: string) {
    const institutionId = UUID.fromString(id);
    const institution = await this._institutionModel.findOne({ 
      where: { id: institutionId.getValue() } 
    });
    if (!institution) {
      throw new NotFoundException(`Institución con id ${id} no encontrada`);
    }
    return institution;
  }

  async findByCode(code: string) {
    const institution = await this._institutionModel.findOne({ 
      where: { code } 
    });
    return institution || null;
  }

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto) {
    const institutionId = UUID.fromString(id);
    const updateData: Partial<Institution> = {};

    if (Object.keys(updateInstitutionDto).length === 0) {
      throw new BadRequestException('Debe haber al menos una propiedad para actualizar');
    }


    if(updateData.id){
      updateData.id = institutionId.getValue();
    }
    
    if(updateData.code) {
      updateData.code = updateInstitutionDto.code;
    }

    if(updateData.name) {
      updateData.name = updateInstitutionDto.name;
    }

    
    const institution = await this._institutionModel.update(updateData, { 
      where: { id: institutionId.getValue() } 
    });

    if (!institution) {
      throw new NotFoundException(`Institución con ID ${id} no encontrada.`);
    }

    return institution;
  }

  async remove(id: string) {
    const institutionId = UUID.fromString(id);
    const deletedInstitution = await this._institutionModel.delete({ 
      where: { id: institutionId.getValue() } 
    });

    if (!deletedInstitution) {
      throw new NotFoundException('Institución no encontrada');
    }

    return { message: `Institución con ID: (${deletedInstitution.id}) ha sido eliminada exitosamente!` };
  }
}
