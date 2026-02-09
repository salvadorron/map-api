import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from 'src/services/log.service';
import { LogFilters } from 'src/dto/filters.dto';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  findAll(@Query() filters: LogFilters) {
    return this.logService.findAll(filters);
  }
}

