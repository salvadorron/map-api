import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateFilledFormDto } from 'src/dto/create-filled_form.dto';
import { FilledFormFilters } from 'src/dto/filters.dto';
import { UpdateFilledFormDto } from 'src/dto/update-filled_form.dto';
import { FilledForm } from 'src/entities/filled_form.entity';
import { UUID } from 'src/helpers/uuid';
import PDFDocument from 'pdfkit';

@Injectable()
export class FilledFormService {
  constructor(private readonly db: PgService) { }
  async create(createFilledFormDto: CreateFilledFormDto) {
    const { form_id, shape_id, records, title, user_id } = createFilledFormDto;
    const recordsObject = Object.fromEntries(records.entries());
    const filledFormId = UUID.create();
    const userIdValue = user_id ? UUID.fromString(user_id).getValue() : null;
    const filledForm = await this.db.runInTransaction(async (client) => {
      const formVersionResult = await client.query<{ id: string }>(
        'SELECT id FROM public.form_versions WHERE form_id = $1 AND is_active = TRUE ORDER BY version_number DESC LIMIT 1',
        [form_id]
      );
      
      if (formVersionResult.rowCount === 0) {
        throw new NotFoundException(`No active version found for form with ID ${form_id}`)
      }
      
      const formVersionId = formVersionResult.rows[0].id;
      
      const result = await client.query<FilledForm>(
        'INSERT INTO public.filled_forms (id, form_version_id, shape_id, records, title, user_id, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [filledFormId.getValue(), formVersionId, shape_id, recordsObject, title, userIdValue, new Date(), new Date()]
      );
      
      // Obtener el form_id para incluirlo en la respuesta
      const formIdResult = await client.query<{ form_id: string }>(
        'SELECT form_id FROM public.form_versions WHERE id = $1',
        [formVersionId]
      );
      
      return {
        ...result.rows[0],
        form_id: formIdResult.rows[0]?.form_id || form_id
      };
    })
    return filledForm;
  }

  findAll(filters: FilledFormFilters = {}) {
    const { query, values } = this.buildQuery(filters);
    return this.db.runInTransaction(async (client) => {
      // Modificar la query para incluir form_id mediante JOIN
      let modifiedQuery: string;
      if (query.includes('WHERE')) {
        modifiedQuery = query.replace(
          'SELECT * FROM public.filled_forms WHERE',
          `SELECT ff.*, fv.form_id 
           FROM public.filled_forms ff 
           INNER JOIN public.form_versions fv ON ff.form_version_id = fv.id 
           WHERE`
        );
      } else {
        modifiedQuery = query.replace(
          'SELECT * FROM public.filled_forms',
          `SELECT ff.*, fv.form_id 
           FROM public.filled_forms ff 
           INNER JOIN public.form_versions fv ON ff.form_version_id = fv.id`
        );
      }
      
      const result = await client.query<FilledForm & { form_id: string }>(modifiedQuery, values);
      return result.rows;
    })
  }

  findOne(id: string) {
    const filledFormId = UUID.fromString(id);
    return this.db.runInTransaction(async (client) => {
      const result = await client.query<FilledForm>('SELECT * FROM public.filled_forms WHERE id = $1', [filledFormId.getValue()]);
      if (result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
  }

  async update(id: string, updateFilledFormDto: UpdateFilledFormDto) {
    const filledFormId = UUID.fromString(id);
    const { user_id, records, form_version_id, ...otherFields } = updateFilledFormDto;
    const keys = Object.keys(otherFields);

    // Filtrar campos que no existen en la tabla (como form_id que ahora es form_version_id)
    const validKeys = keys.filter(key => {
      // Excluir form_id y form_version_id ya que se manejarán por separado
      return key !== 'form_id' && key !== 'form_version_id';
    });

    if (validKeys.length === 0 && user_id === undefined && records === undefined && form_version_id === undefined) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    const filledForm = await this.db.runInTransaction(async (client) => {
      const updates: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Manejar form_version_id: si se envía form_version_id, actualizar directamente
      if (form_version_id !== undefined) {
        // Validar que la versión del formulario existe
        const formVersionResult = await client.query<{ id: string }>(
          'SELECT id FROM public.form_versions WHERE id = $1',
          [form_version_id]
        );
        
        if (formVersionResult.rowCount === 0) {
          throw new NotFoundException(`Form version with ID ${form_version_id} not found`)
        }
        
        updates.push(`form_version_id = $${paramIndex}`);
        updateValues.push(form_version_id);
        paramIndex++;
      }

      // Manejar campos normales válidos
      validKeys.forEach(key => {
        updates.push(`"${key}" = $${paramIndex}`);
        updateValues.push(otherFields[key]);
        paramIndex++;
      });

      if (records !== undefined) {
        updates.push(`records = $${paramIndex}`);
        const recordsObject = records instanceof Map ? Object.fromEntries(records.entries()) : records;
        updateValues.push(recordsObject);
        paramIndex++;
      }

      if (user_id !== undefined) {
        updates.push(`user_id = $${paramIndex}`);
        updateValues.push(user_id ? UUID.fromString(user_id).getValue() : null);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);
      updateValues.push(filledFormId.getValue());

      const query = `
        UPDATE public.filled_forms
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      const result = await client.query<FilledForm>(query, updateValues);
      if (result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      
      const formIdResult = await client.query<{ form_id: string }>(
        'SELECT form_id FROM public.form_versions WHERE id = $1',
        [result.rows[0].form_version_id]
      );
      
      return {
        ...result.rows[0],
        form_id: formIdResult.rows[0]?.form_id
      };
    })
    return filledForm;
  }

  async updateToLatestVersion(id: string) {
    const filledFormId = UUID.fromString(id);
    const filledForm = await this.db.runInTransaction(async (client) => {
      const filledFormResult = await client.query<FilledForm>(
        'SELECT * FROM public.filled_forms WHERE id = $1',
        [filledFormId.getValue()]
      );
      
      if (filledFormResult.rowCount === 0) {
        throw new NotFoundException(`Filled form with ID ${id} not found.`)
      }
      
      const currentFilledForm = filledFormResult.rows[0];
      
      // Obtener el form_id desde la versión actual del formulario
      const formIdResult = await client.query<{ form_id: string }>(
        'SELECT form_id FROM public.form_versions WHERE id = $1',
        [currentFilledForm.form_version_id]
      );
      
      if (formIdResult.rowCount === 0) {
        throw new NotFoundException(`Form version with ID ${currentFilledForm.form_version_id} not found.`)
      }
      
      const formId = formIdResult.rows[0].form_id;
      
      const latestVersionResult = await client.query<{ id: string }>(
        'SELECT id FROM public.form_versions WHERE form_id = $1 AND is_active = TRUE ORDER BY version_number DESC LIMIT 1',
        [formId]
      );
      
      if (latestVersionResult.rowCount === 0) {
        throw new NotFoundException(`No active version found for form with ID ${formId}`)
      }
      
      const latestVersionId = latestVersionResult.rows[0].id;
      
      // Si ya está en la versión más reciente, retornar sin cambios
      if (currentFilledForm.form_version_id === latestVersionId) {
        return {
          ...currentFilledForm,
          form_id: formId,
          message: 'Filled form is already using the latest version'
        };
      }
      
      const updateResult = await client.query<FilledForm>(
        `UPDATE public.filled_forms 
         SET form_version_id = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING *`,
        [latestVersionId, filledFormId.getValue()]
      );
      
      return {
        ...updateResult.rows[0],
        form_id: formId
      };
    })
    return filledForm;
  }

  async remove(id: string) {
    const filledFormId = UUID.fromString(id);
    const filledForm = await this.db.runInTransaction(async (client) => {
      const result = await client.query<Pick<FilledForm, 'id'>>('DELETE FROM public.filled_forms WHERE id = $1 RETURNING id', [filledFormId.getValue()]);
      if (result.rowCount === 0) throw new NotFoundException(`Filled form with ID ${id} not found.`)
      return result.rows[0];
    })
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

  private buildQuery(filters: FilledFormFilters = {}) {
    if (filters.shape_id) {
      return { query: 'SELECT * FROM public.filled_forms WHERE shape_id = $1', values: [filters.shape_id] }
    }
    return { query: 'SELECT * FROM public.filled_forms', values: undefined }
  }
}
