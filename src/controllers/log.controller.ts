import { Controller, Get } from '@nestjs/common';
import { LogService } from 'src/services/log.service';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  findAll() {
    return this.logService.findAll();
  }
}

