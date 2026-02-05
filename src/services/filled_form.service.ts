import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateFilledFormDto } from 'src/dto/create-filled_form.dto';
import { FilledFormFilters } from 'src/dto/filters.dto';
import { UpdateFilledFormDto } from 'src/dto/update-filled_form.dto';
import { FilledForm } from 'src/entities/filled_form.entity';
import { UUID } from 'src/helpers/uuid';
import PDFDocument from 'pdfkit';
import { FormVersion } from 'src/entities/form_version.entity';
import { FilledFormModel } from 'src/models/filled-form.model';

@Injectable()
export class FilledFormService {
  private filledFormModel: FilledFormModel;

  constructor(private readonly db: PgService) {
    this.filledFormModel = new FilledFormModel(this.db);
  }

  async create(createFilledFormDto: CreateFilledFormDto) {
    const records = Object.fromEntries(createFilledFormDto.records.entries());
    const filledFormId = UUID.create();
    const userIdValue = createFilledFormDto.user_id ? UUID.fromString(createFilledFormDto.user_id).getValue() : null;
    
    const formVersionModel = this.filledFormModel.getFormVersionModel();
    const formVersion = await formVersionModel.findOne({ 
      where: { form_id: createFilledFormDto.form_id, is_active: true } 
    });
    
    if (!formVersion) {
      throw new NotFoundException(`No active version found for form with ID ${createFilledFormDto.form_id}`);
    }
    
    const filledForm = await this.filledFormModel.create({ 
      id: filledFormId.getValue(), 
      form_version_id: formVersion.id, 
      shape_id: createFilledFormDto.shape_id, 
      records: records, 
      title: createFilledFormDto.title, 
      user_id: userIdValue 
    });

    return {
      ...filledForm,
      form_id: formVersion.form_id
    };
  }

  async findAll(filters: FilledFormFilters = {}) {
    const where: Record<string, string> = {};

    if (filters.shape_id) {
      where.shape_id = filters.shape_id;
    }

    const filledForms = await this.filledFormModel.findAll({ 
      where, 
      include: ['formVersion'] 
    }) as unknown as (FilledForm & { formVersion: FormVersion })[];

    return filledForms.map(filledForm => {
      const { formVersion, ...rest } = filledForm;
      return {
        ...rest,
        form_id: formVersion?.form_id
      };
    });
  }

  async findOne(id: string) {
    const filledFormId = UUID.fromString(id);
    const filledForm = await this.filledFormModel.findOne({ 
      where: { id: filledFormId.getValue() } 
    });
    
    if (!filledForm) {
      throw new NotFoundException(`Filled form with ID ${id} not found.`);
    }
    
    return filledForm;
  }

  async update(id: string, updateFilledFormDto: UpdateFilledFormDto) {
    const filledFormId = UUID.fromString(id);

    const updateData: Partial<FilledForm> = {};

    if(updateFilledFormDto.records){
      updateData.records = Object.fromEntries(updateFilledFormDto.records.entries());
    }

    if(updateFilledFormDto.shape_id){
      updateData.shape_id = updateFilledFormDto.shape_id;
    }

    if(updateFilledFormDto.title) {
      updateData.title = updateFilledFormDto.title;
    }

    if(updateFilledFormDto.user_id){
      updateData.user_id = UUID.fromString(updateFilledFormDto.user_id).getValue();
    }

    if(Object.keys(updateData).length === 0) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    
    const formVersionModel = this.filledFormModel.getFormVersionModel();
    if (updateFilledFormDto.form_version_id) {
      const formVersion = await formVersionModel.findOne({ where: { id: updateFilledFormDto.form_version_id } });
      if (!formVersion) {
        throw new NotFoundException(`Form version with ID ${updateFilledFormDto.form_version_id} not found`);
      }
    }

    console.log('Entro');

    const filledForm = await this.filledFormModel.update(updateData, { 
      where: { id: filledFormId.getValue() } 
    });

    if (!filledForm) {
      throw new NotFoundException(`Filled form with ID ${id} not found.`);
    }

    const formVersion = await formVersionModel.findOne({ 
      where: { id: filledForm.form_version_id } 
    });

    return {
      ...filledForm,
      form_id: formVersion?.form_id
    };
  }

  async updateToLatestVersion(id: string) {
    const filledFormId = UUID.fromString(id);
    const formVersionModel = this.filledFormModel.getFormVersionModel();
    
    const currentFilledForm = await this.filledFormModel.findOne({ 
      where: { id: filledFormId.getValue() } 
    });

    if (!currentFilledForm) {
      throw new NotFoundException(`Filled form with ID ${id} not found.`);
    }

    const currentFormVersion = await formVersionModel.findOne({ 
      where: { id: currentFilledForm.form_version_id } 
    });

    if (!currentFormVersion) {
      throw new NotFoundException(`Form version with ID ${currentFilledForm.form_version_id} not found.`);
    }

    const formId = currentFormVersion.form_id;

    const activeVersions = await formVersionModel.findAll({ 
      where: { form_id: formId, is_active: true },
      order: { version_number: 'DESC' },
      limit: 1
    });

    if (activeVersions.length === 0) {
      throw new NotFoundException(`No active version found for form with ID ${formId}`);
    }

    const latestVersion = activeVersions[0];

    if (currentFilledForm.form_version_id === latestVersion.id) {
      return {
        ...currentFilledForm,
        form_id: formId,
        message: 'Filled form is already using the latest version'
      };
    }

    const updatedFilledForm = await this.filledFormModel.update(
      { form_version_id: latestVersion.id },
      { where: { id: filledFormId.getValue() } }
    );

    if (!updatedFilledForm) {
      throw new NotFoundException(`Filled form with ID ${id} not found.`);
    }

    return {
      ...updatedFilledForm,
      form_id: formId
    };
  }

  async remove(id: string) {
    const filledFormId = UUID.fromString(id);
    const filledForm = await this.filledFormModel.delete({ 
      where: { id: filledFormId.getValue() } 
    });
    
    if (!filledForm) {
      throw new NotFoundException(`Filled form with ID ${id} not found.`);
    }
    
    return { message: `Filled form with ID: (${filledForm.id}) has deleted successfully!` };
  }



  async getReportDataByMunicipalityAndParrish() {
    return this.db.runInTransaction(async (client) => {
      const query = `
        SELECT 
          ff.id as filled_form_id,
          ff.title as form_title,
          ff.records,
          ff.created_at as filled_form_created_at,
          s.id as shape_id,
          s.properties->>'cod_mun' as cod_mun,
          s.properties->>'cod_prq' as cod_prq,
          COALESCE(m.id, NULL) as municipality_id,
          COALESCE(m.name, s.properties->>'cod_mun', 'Sin Municipio') as municipality_name,
          COALESCE(p.id, NULL) as parrish_id,
          COALESCE(p.name, 'Sin Parroquia') as parrish_name,
          COALESCE(p.code, '') as parrish_code,
          f.title as form_name
        FROM public.filled_forms ff
        INNER JOIN public.shapes s ON ff.shape_id = s.id
        INNER JOIN public.form_versions fv ON ff.form_version_id = fv.id
        INNER JOIN public.forms f ON fv.form_id = f.id
        LEFT JOIN public.municipalities m ON (
          s.properties->>'cod_mun' = m.short_name 
          OR s.properties->>'cod_mun' = m.id::text
          OR s.properties->>'cod_mun' = m.name
        )
        LEFT JOIN public.parrishes p ON (
          (s.properties->>'cod_prq')::uuid = p.id
        )
        ORDER BY 
          COALESCE(m.name, s.properties->>'cod_mun', 'Sin Municipio'),
          COALESCE(p.name, 'Sin Parroquia'),
          ff.created_at DESC
      `;

      const result = await client.query(query);
      return result.rows;
    });
  }

  private formatRecordValue(value: any, maxLength: number = 100): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const items = value.slice(0, 3).map(item => this.formatRecordValue(item, 30));
      const more = value.length > 3 ? ` y ${value.length - 3} más` : '';
      return `[${items.join(', ')}${more}]`;
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return '{}';
      const items = keys.slice(0, 2).map(key => `${key}: ${this.formatRecordValue(value[key], 20)}`);
      const more = keys.length > 2 ? ` y ${keys.length - 2} más` : '';
      return `{${items.join(', ')}${more}}`;
    }

    return String(value);
  }

  private formatFieldName(fieldName: string): string {
    // Convertir nombres de campos de snake_case o camelCase a formato legible
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  async generatePDFReport(): Promise<Buffer> {
    const data = await this.getReportDataByMunicipalityAndParrish();

    // Organizar datos por municipio y parroquia
    const organizedData: Record<string, Record<string, any[]>> = {};

    data.forEach((row: any) => {
      const municipalityKey = row.municipality_name || row.cod_mun || 'Sin Municipio';
      const parrishKey = row.parrish_name || 'Sin Parroquia';

      if (!organizedData[municipalityKey]) {
        organizedData[municipalityKey] = {};
      }

      if (!organizedData[municipalityKey][parrishKey]) {
        organizedData[municipalityKey][parrishKey] = [];
      }

      organizedData[municipalityKey][parrishKey].push(row);
    });

    // Generar PDF
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Título del reporte
      doc.fontSize(20).text('Reporte Territorial', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' });
      doc.moveDown(2);

      // Iterar por municipios
      Object.keys(organizedData).forEach((municipality, munIndex) => {
        // Título del municipio
        doc.fontSize(16).fillColor('#1a1a1a').text(`Municipio: ${municipality}`, { underline: true });
        doc.moveDown(0.5);

        // Iterar por parroquias
        Object.keys(organizedData[municipality]).forEach((parrish, parIndex) => {
          const forms = organizedData[municipality][parrish];

          // Título de la parroquia
          doc.fontSize(14).fillColor('#333333').text(`Parroquia: ${parrish}`, { indent: 20 });
          doc.moveDown(0.3);

          // Listar formularios
          forms.forEach((form: any, formIndex: number) => {
            // Verificar si necesitamos una nueva página
            if (doc.y > 700) {
              doc.addPage();
            }

            doc.fontSize(11).fillColor('#000000');
            doc.text(new Date(form.filled_form_created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }), {
              indent: 40,
              continued: false
            });

            // Mostrar records como Label: Value (cada input es una entrada)
            if (form.records && typeof form.records === 'object') {
              const records = form.records as Record<
                string,
                { label?: string; value?: any; type?: string } | any
              >;

              const recordKeys = Object.keys(records);
              if (recordKeys.length > 0) {
                const sectionTitle =
                  (form.form_name && String(form.form_name).trim()) ||
                  (form.form_title && String(form.form_title).trim()) ||
                  'Formulario';
                doc.moveDown(0.3);
                doc
                  .fontSize(9)
                  .fillColor('#444444')
                  .text(sectionTitle, { indent: 50, underline: true });
                doc.moveDown(0.2);

                // Preferir el formato { label, value } guardado en records
                const labelValueEntries = recordKeys
                  .map((k) => records[k])
                  .filter(
                    (v) =>
                      v &&
                      typeof v === 'object' &&
                      'label' in v &&
                      'value' in v &&
                      typeof (v as any).label === 'string',
                  )
                  .map((v) => ({
                    label: String((v as any).label),
                    value: (v as any).value,
                    type: (v as any).type as string | undefined,
                  }))
                  .sort((a, b) => a.label.localeCompare(b.label, 'es'));

                const fallbackEntries =
                  labelValueEntries.length > 0
                    ? labelValueEntries
                    : recordKeys.map((key) => ({
                      label: this.formatFieldName(key),
                      value: records[key],
                    }));

                fallbackEntries.forEach((entry) => {
                  const formattedLabel = entry.label;
                  const formattedValue = this.formatRecordValue(entry.value, 120);

                  if (doc.y > 720) doc.addPage();

                  doc.fontSize(8).fillColor('#555555').text(`${formattedLabel}:`, {
                    indent: 55,
                    continued: false,
                  });
                  doc.fontSize(8).fillColor('#333333');

                  // Mejor lectura para arrays tipo checkbox/select múltiple
                  const valueText =
                    Array.isArray(entry.value) && entry.value.every((x) => typeof x === 'string')
                      ? (entry.value as string[]).join(', ')
                      : formattedValue;

                  const lines = String(valueText).match(/.{1,70}/g) || [String(valueText)];
                  lines.forEach((line) => {
                    doc.text(line, { indent: 70, continued: false });
                  });

                  doc.moveDown(0.15);
                });
              }
            }

            doc.moveDown(0.5);

            // Línea separadora
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').lineWidth(0.5).stroke();
            doc.moveDown(0.5);
          });

          doc.moveDown(0.5);
        });

        doc.moveDown(1);

        // Agregar nueva página si no es el último municipio
        if (munIndex < Object.keys(organizedData).length - 1) {
          doc.addPage();
        }
      });

      // Pie de página
      doc.fontSize(8).fillColor('#999999');
      doc.text(
        `Total de formularios: ${data.length}`,
        { align: 'center' }
      );

      doc.end();
    });
  }

}
