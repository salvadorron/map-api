import { Injectable } from '@nestjs/common';
import { CreateFilledFormDto } from './dto/create-filled_form.dto';
import { UpdateFilledFormDto } from './dto/update-filled_form.dto';

@Injectable()
export class FilledFormService {
  create(createFilledFormDto: CreateFilledFormDto) {
    return 'This action adds a new filledForm';
  }

  findAll() {
    return `This action returns all filledForm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} filledForm`;
  }

  update(id: number, updateFilledFormDto: UpdateFilledFormDto) {
    return `This action updates a #${id} filledForm`;
  }

  remove(id: number) {
    return `This action removes a #${id} filledForm`;
  }
}
