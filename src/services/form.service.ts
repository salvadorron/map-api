import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg-config.service';
import { CreateFormDto } from 'src/dto/create-form.dto';
import { FormFilters } from 'src/dto/filters.dto';
import { UpdateFormDto } from 'src/dto/update-form.dto';
import { Form } from 'src/entities/form.entity';
import { UUID } from 'src/helpers/uuid';
import { FormModel } from 'src/models/form.model';

@Injectable()
export class FormService {
  private formModel: FormModel;

  constructor(private readonly db: PgService) {
    this.formModel = new FormModel(this.db);
  }

  async create(createFormDto: CreateFormDto) {
    const { inputs, title, category_ids, tag } = createFormDto;

    const formId = UUID.create();
    const formVersionId = UUID.create();

    const form = await this.formModel.create({
      id: formId.getValue(),
      title,
      tag
    });

    const formVersionModel = this.formModel.getFormVersionModel();
    await formVersionModel.create({
      id: formVersionId.getValue(),
      form_id: formId.getValue(),
      version_number: 1,
      inputs,
      title,
      tag,
      is_active: true
    });

    const formCategoryAssignamentModel = this.formModel.getFormCategoryAssignamentModel();
    for (const categoryId of category_ids) {
      await formCategoryAssignamentModel.create({
        form_id: formId.getValue(),
        category_id: UUID.fromString(categoryId).getValue()
      });
    }

    return form;
  }

  async findAll(filters: FormFilters = {}) {
    const options: any = {};

    if (filters.category_ids) {
      const splittedCategories = filters.category_ids.split(',');
      options.whereRelation = {
        categories: {
          id: { in: splittedCategories }
        }
      };
    }

    const forms = await this.formModel.findAll(options);

    const formsWithVersions = await Promise.all(
      forms.map(async (form) => {
        const formWithVersion = await this.formModel.findByPk(form.id, [
          {
            relation: 'versions',
            where: { is_active: true },
            order: { version_number: 'DESC' },
            limit: 1
          },
          {
            relation: 'categories'
          }
        ]);

        const activeVersion = formWithVersion && (formWithVersion as any).versions
          ? (formWithVersion as any).versions[0]
          : null;
        const categories = (formWithVersion as any)?.categories || [];

        return {
          ...form,
          active_version: activeVersion || null,
          categories
        };
      })
    );

    return formsWithVersions;
  }

  async findOne(id: string) {
    const formVersionId = UUID.fromString(id);

    const formVersionModel = this.formModel.getFormVersionModel();
    const version = await formVersionModel.findOne({
      where: { id: formVersionId.getValue() }
    });

    if (!version) {
      throw new NotFoundException('Form not found');
    }

    const form = await this.formModel.findByPk(version.form_id, ['categories']);

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return {
      ...form,
      active_version: version,
      categories: (form as any).categories || []
    };
  }

  async update(id: string, updateFormDto: UpdateFormDto) {
    const formId = UUID.fromString(id);
    const { category_ids, inputs, title, tag, ...otherFields } = updateFormDto;
    const keys = Object.keys(otherFields);

    if (keys.length === 0 && !category_ids && !inputs && title === undefined && tag === undefined) {
      throw new BadRequestException('Must be at least one property to patch');
    }

    const currentForm = await this.formModel.findOne({ where: { id: formId.getValue() } });
    if (!currentForm) {
      throw new NotFoundException(`Form with ID ${id} not found.`);
    }

    const formVersionModel = this.formModel.getFormVersionModel();
    const formCategoryAssignamentModel = this.formModel.getFormCategoryAssignamentModel();

    const needsNewVersion = inputs !== undefined || title !== undefined || tag !== undefined;

    if (needsNewVersion) {
      const allVersions = await formVersionModel.findAll({
        where: { form_id: formId.getValue() }
      });

      const nextVersionNumber = allVersions.length > 0
        ? Math.max(...allVersions.map(v => (v as any).version_number || 0)) + 1
        : 1;

      await formVersionModel.update(
        { is_active: false },
        { where: { form_id: formId.getValue() } }
      );

      const newTitle = title !== undefined ? title : currentForm.title;
      const newTag = tag !== undefined ? tag : currentForm.tag;
      let inputsToUse = inputs !== undefined ? inputs : [];

      if (inputs === undefined && allVersions.length > 0) {
        const sortedVersions = allVersions.sort((a, b) =>
          (b as any).version_number - (a as any).version_number
        );
        inputsToUse = sortedVersions[0]?.inputs || [];
      }

      const formVersionId = UUID.create();
      await formVersionModel.create({
        id: formVersionId.getValue(),
        form_id: formId.getValue(),
        version_number: nextVersionNumber,
        inputs: inputsToUse,
        title: newTitle,
        tag: newTag,
        is_active: true
      });

      const formUpdateData: Partial<Form> = {};
      if (title !== undefined) {
        formUpdateData.title = title;
      }
      if (tag !== undefined) {
        formUpdateData.tag = tag;
      }

      if (Object.keys(formUpdateData).length > 0) {
        await this.formModel.update(formUpdateData, { where: { id: formId.getValue() } });
      }
    } else {
      if (keys.length > 0) {
        const updateData: Partial<Form> = {};
        keys.forEach(key => {
          (updateData as any)[key] = otherFields[key];
        });
        await this.formModel.update(updateData, { where: { id: formId.getValue() } });
      }
    }

    if (category_ids !== undefined) {
      await formCategoryAssignamentModel.delete({ where: { form_id: formId.getValue() } });

      for (const categoryId of category_ids) {
        await formCategoryAssignamentModel.create({
          form_id: formId.getValue(),
          category_id: UUID.fromString(categoryId).getValue()
        });
      }
    }

    const updatedForm = await this.formModel.findByPk(formId.getValue(), [
      {
        relation: 'versions',
        where: { is_active: true },
        order: { version_number: 'DESC' },
        limit: 1
      }
    ]);

    const activeVersion = updatedForm && (updatedForm as any).versions
      ? (updatedForm as any).versions[0]
      : null;

    return {
      ...updatedForm,
      active_version: activeVersion
    };
  }

  async remove(id: string) {
    const formId = UUID.fromString(id);

    try {
      const form = await this.formModel.delete({
        where: { id: formId.getValue() }
      });

      if (!form) {
        throw new NotFoundException(`Form with ID ${id} not found.`);
      }

      return { message: `Form with ID: (${form.id}) has deleted successfully!` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`This form is being used by a filled form.`);
    }
  }

}
