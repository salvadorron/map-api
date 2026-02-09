import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { CategoryService } from './category.service';
import { UsersService } from './users.service';
import { LogService } from './log.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly usersService: UsersService,
    private readonly logService: LogService,
  ) {}

  async generateCategoriesPdf(filters: any, stream: NodeJS.WritableStream) {
    const fullFilters = { limit: 1000000, page: 1 };

    const result = await this.categoryService.findAll(fullFilters);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(stream);

    // Header (compact) - Español
    doc.fontSize(14).font('Helvetica-Bold').text('Reporte de categorías', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(7).font('Helvetica').fillColor('gray').text(`Generado: ${new Date().toISOString()}`, { align: 'center' });
    doc.moveDown(0.2);

    // Table columns (no ID)
    const startX = doc.x;
    const columnWidths = [360, 180]; // name, element_type
    const headers = ['Nombre', 'Tipo'];

    doc.moveDown(0.5);
    // Draw header row
    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
    let x = startX;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x, doc.y, { width: columnWidths[i], continued: false });
      x += columnWidths[i];
    }
    doc.moveDown(0.3);

    // Rows
    doc.font('Helvetica').fontSize(8).fillColor('black');
    for (const cat of result.data) {
      if (doc.y > doc.page.height - 80) {
        this.addFooter(doc);
        doc.addPage();
      }
      x = startX;
      doc.text(cat.name || '', x, doc.y, { width: columnWidths[0] });
      x += columnWidths[0];
      doc.text(cat.element_type || '', x, doc.y, { width: columnWidths[1] });
      doc.moveDown(0.2);
    }

    doc.moveDown(0.2);
    doc.fontSize(8).font('Helvetica-Bold').text(`Total: ${result.metadata?.total ?? result.data.length}`);
    this.addFooter(doc);
    doc.end();
  }

  async generateUsersPdf(filters: any, stream: NodeJS.WritableStream) {
    const fullFilters = { limit: 1000000, page: 1 };
    const result = await this.usersService.findAll(fullFilters);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(stream);

    doc.fontSize(14).font('Helvetica-Bold').text('Reporte de usuarios', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(7).font('Helvetica').fillColor('gray').text(`Generado: ${new Date().toISOString()}`, { align: 'center' });
    doc.moveDown(0.2);

    const startX = doc.x;
    // Ajuste de anchos para A4 usable (~doc.page.width - margins)
    const columnWidths = [270, 110, 110]; // fullname, username, institution (suma ~490)
    const headers = ['Nombre completo', 'Usuario', 'Institución'];

    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
    let x = startX;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x, doc.y, { width: columnWidths[i] });
      x += columnWidths[i];
    }
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(8).fillColor('black');
    for (const u of result.data) {
      if (doc.y > doc.page.height - 80) {
        this.addFooter(doc);
        doc.addPage();
      }
      x = startX;
      doc.text(u.fullname || '', x, doc.y, { width: columnWidths[0] });
      x += columnWidths[0];
      doc.text(u.username || '', x, doc.y, { width: columnWidths[1] });
      x += columnWidths[1];
      const instName = u.institution?.name || '';
      doc.text(instName, x, doc.y, { width: columnWidths[2] });
      doc.moveDown(0.2);
    }

    doc.moveDown(0.2);
    doc.fontSize(8).font('Helvetica-Bold').text(`Total: ${result.metadata?.total ?? result.data.length}`);
    this.addFooter(doc);
    doc.end();
  }

  async generateLogsPdf(filters: any, stream: NodeJS.WritableStream) {
    const fullFilters = { limit: 1000000, page: 1 };

    const result = await this.logService.findAll(fullFilters);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(stream);

    doc.fontSize(14).font('Helvetica-Bold').text('Reporte de actividad', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(7).font('Helvetica').fillColor('gray').text(`Generado: ${new Date().toISOString()}`, { align: 'center' });
    doc.moveDown(0.2);

    doc.fontSize(8);
    for (const l of result.data) {
      const logItem: any = l;
      const user = logItem.user;
      const userLabel = user ? `${user.fullname} (${user.username})` : 'unknown';
      const instLabel = user && user.institution ? ` - ${user.institution.name}` : '';
      const ts = this.formatDate(logItem.created_at);
      doc.text(`- [${logItem.action}] ${logItem.resource_type} por ${userLabel}${instLabel} a las ${ts}`);
    }

    doc.moveDown(0.2);
    doc.fontSize(8).font('Helvetica-Bold').text(`Total: ${result.metadata?.total ?? result.data.length}`);
    this.addFooter(doc);
    doc.end();
  }

  private addFooter(doc: any) {
    try {
      const footerY = doc.page.height - 40;
      const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      doc.fontSize(8).fillColor('gray');
      doc.text(`Generated: ${new Date().toLocaleString()}`, doc.page.margins.left, footerY, {
        width,
        align: 'center',
      });
    } catch (e) {
      // non-fatal for PDF generation
    }
  }

  private formatDate(value: any) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
}
