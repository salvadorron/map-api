import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreateFilledFormDto } from 'src/dto/create-filled_form.dto';
import { FilledFormFilters } from 'src/dto/filters.dto';
import { UpdateFilledFormDto } from 'src/dto/update-filled_form.dto';
import { FilledFormService } from 'src/services/filled_form.service';

@Controller('filled-forms')
export class FilledFormController {
  constructor(private readonly filledFormService: FilledFormService) {}

  @Post()
  create(@Body() createFilledFormDto: CreateFilledFormDto) {
    return this.filledFormService.create(createFilledFormDto);
  }

  @Get()
  findAll(@Query() filters: FilledFormFilters) {
    return this.filledFormService.findAll(filters);
  }

  @Get('report/pdf')
  async generatePDFReport(@Res() res: Response) {
    try {
      const pdfBuffer = await this.filledFormService.generatePDFReport();
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-formularios-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error al generar el reporte PDF',
        error: error.message 
      });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filledFormService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilledFormDto: UpdateFilledFormDto) {
    return this.filledFormService.update(id, updateFilledFormDto);
  }

  @Patch(':id/update-to-latest-version')
  updateToLatestVersion(@Param('id') id: string) {
    return this.filledFormService.updateToLatestVersion(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filledFormService.remove(id);
  }
}
