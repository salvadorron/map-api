import { Injectable } from '@nestjs/common';
import { CreateParrishDto } from './dto/create-parrish.dto';
import { UpdateParrishDto } from './dto/update-parrish.dto';

@Injectable()
export class ParrishService {
  create(createParrishDto: CreateParrishDto) {
    return 'This action adds a new parrish';
  }

  findAll() {
    return `This action returns all parrish`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parrish`;
  }

  update(id: number, updateParrishDto: UpdateParrishDto) {
    return `This action updates a #${id} parrish`;
  }

  remove(id: number) {
    return `This action removes a #${id} parrish`;
  }
}
