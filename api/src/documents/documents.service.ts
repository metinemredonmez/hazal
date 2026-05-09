import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, DocumentCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateDocumentInput {
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  listingId?: string;
  inquiryId?: string;
  appointmentId?: string;
  customerName?: string;
  tags?: string[];
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDocumentInput) {
    return this.prisma.document.create({
      data: {
        title: input.title,
        category: input.category,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        description: input.description,
        listingId: input.listingId || null,
        inquiryId: input.inquiryId || null,
        appointmentId: input.appointmentId || null,
        customerName: input.customerName,
        tags: input.tags ?? [],
      },
      include: {
        listing: { select: { slug: true, titleTr: true } },
        inquiry: { select: { name: true, email: true } },
      },
    });
  }

  async list(opts: {
    page?: number;
    pageSize?: number;
    category?: DocumentCategory;
    search?: string;
    listingId?: string;
    inquiryId?: string;
  } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 30;
    const where: Prisma.DocumentWhereInput = {};
    if (opts.category) where.category = opts.category;
    if (opts.listingId) where.listingId = opts.listingId;
    if (opts.inquiryId) where.inquiryId = opts.inquiryId;
    if (opts.search) {
      where.OR = [
        { title: { contains: opts.search, mode: 'insensitive' } },
        { customerName: { contains: opts.search, mode: 'insensitive' } },
        { description: { contains: opts.search, mode: 'insensitive' } },
        { tags: { has: opts.search.toLowerCase() } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          listing: { select: { slug: true, titleTr: true } },
          inquiry: { select: { name: true, email: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        listing: { select: { slug: true, titleTr: true } },
        inquiry: { select: { name: true, email: true } },
      },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, dto: Partial<CreateDocumentInput>) {
    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.listingId !== undefined) data.listingId = dto.listingId || null;
    if (dto.inquiryId !== undefined) data.inquiryId = dto.inquiryId || null;
    if (dto.appointmentId !== undefined) data.appointmentId = dto.appointmentId || null;
    if (dto.customerName !== undefined) data.customerName = dto.customerName;
    if (dto.tags !== undefined) data.tags = dto.tags;
    return this.prisma.document.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.document.delete({ where: { id } });
    return { ok: true };
  }

  async stats() {
    const byCategory = await this.prisma.document.groupBy({
      by: ['category'],
      _count: { _all: true },
    });
    const total = await this.prisma.document.count();
    return {
      total,
      byCategory: byCategory.map((r) => ({ category: r.category, count: r._count._all })),
    };
  }

  // ─── TEMPLATES ───
  async listTemplates() {
    return this.prisma.documentTemplate.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findTemplate(id: string) {
    const t = await this.prisma.documentTemplate.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }

  async renderTemplate(id: string, values: Record<string, string>): Promise<string> {
    const tpl = await this.findTemplate(id);
    let html = tpl.htmlBody;

    const all: Record<string, string> = {
      ...values,
      year: new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    // Format currency-ish values
    for (const [key, val] of Object.entries(all)) {
      if (
        typeof val === 'string' &&
        /rent|price|deposit|amount|bedel|kira|tutar/i.test(key) &&
        /^\d+(\.\d+)?$/.test(val)
      ) {
        all[key] = new Intl.NumberFormat('tr-TR').format(Number(val));
      }
    }

    // Conditional blocks first
    html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) =>
      all[key] ? body : '',
    );

    // Variable replacement
    html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => all[key] ?? '');

    return html;
  }
}
