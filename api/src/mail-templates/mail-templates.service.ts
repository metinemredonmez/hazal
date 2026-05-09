import { Injectable, NotFoundException } from '@nestjs/common';
import { MailTemplateCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateMailTemplateInput {
  name: string;
  category: MailTemplateCategory;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  variables?: Array<{ key: string; label: string; type?: string; default?: string }>;
  isDefault?: boolean;
}

@Injectable()
export class MailTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  list(category?: MailTemplateCategory) {
    return this.prisma.mailTemplate.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findById(id: string) {
    const t = await this.prisma.mailTemplate.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }

  create(input: CreateMailTemplateInput) {
    return this.prisma.mailTemplate.create({
      data: {
        name: input.name,
        category: input.category,
        subject: input.subject,
        bodyHtml: input.bodyHtml,
        bodyText: input.bodyText ?? this.stripHtml(input.bodyHtml),
        variables: (input.variables ?? null) as object | null,
        isDefault: input.isDefault ?? false,
      },
    });
  }

  update(id: string, input: Partial<CreateMailTemplateInput>) {
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.category !== undefined) data.category = input.category;
    if (input.subject !== undefined) data.subject = input.subject;
    if (input.bodyHtml !== undefined) {
      data.bodyHtml = input.bodyHtml;
      data.bodyText = input.bodyText ?? this.stripHtml(input.bodyHtml);
    } else if (input.bodyText !== undefined) {
      data.bodyText = input.bodyText;
    }
    if (input.variables !== undefined) data.variables = input.variables;
    if (input.isDefault !== undefined) data.isDefault = input.isDefault;
    return this.prisma.mailTemplate.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.mailTemplate.delete({ where: { id } });
    return { ok: true };
  }

  /**
   * Render a template with values, returning {subject, html, text}.
   * Uses the same simple Handlebars-like syntax as document templates:
   * {{varName}} replacement and {{#if varName}}...{{/if}} conditional blocks.
   */
  async render(
    id: string,
    values: Record<string, string>,
  ): Promise<{ subject: string; html: string; text: string }> {
    const tpl = await this.findById(id);
    const all: Record<string, string> = {
      ...values,
      year: new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    const apply = (s: string) =>
      s
        .replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_m, key, body) =>
          all[key] ? body : '',
        )
        .replace(/\{\{(\w+)\}\}/g, (_m, key) => all[key] ?? '');

    return {
      subject: apply(tpl.subject),
      html: apply(tpl.bodyHtml),
      text: apply(tpl.bodyText ?? this.stripHtml(tpl.bodyHtml)),
    };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
