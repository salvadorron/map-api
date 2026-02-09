import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportService } from 'src/services/report.service';
import { CategoryFilters, UserFilters, LogFilters } from 'src/dto/filters.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Get('categories')
  async categories(@Query() filters: CategoryFilters, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="categories.pdf"');
    await this.reportService.generateCategoriesPdf(filters, res);
  }

  @Get('users')
  async users(@Query() filters: UserFilters, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="users.pdf"');
    await this.reportService.generateUsersPdf(filters, res);
  }

  @Get('logs')
  async logs(@Query() filters: LogFilters, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="logs.pdf"');
    await this.reportService.generateLogsPdf(filters, res);
  }
}
