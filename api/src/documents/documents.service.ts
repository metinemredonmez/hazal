import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, DocumentCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { join } from 'path';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

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

  /**
   * Send a stored document as an email attachment.
   */
  async sendByEmail(
    id: string,
    opts: { to: string; subject?: string; message?: string },
  ): Promise<{ ok: true }> {
    const doc = await this.findById(id);
    if (!doc) throw new NotFoundException('Document not found');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.to)) {
      throw new BadRequestException('Geçersiz e-posta adresi');
    }

    // Read file from disk. fileUrl is e.g. "/documents/abc.pdf" (or "/uploads/...").
    const baseDir = doc.fileUrl.startsWith('/uploads/')
      ? this.config.get<string>('UPLOAD_DIR') ?? './uploads'
      : this.config.get<string>('DOCUMENTS_DIR') ?? './documents';
    const filename = doc.fileUrl.split('/').pop() ?? '';
    const fullPath = join(process.cwd(), baseDir, filename);

    let content: Buffer;
    try {
      content = await readFile(fullPath);
    } catch {
      throw new NotFoundException('Belge dosyası diskte bulunamadı');
    }

    const subject = opts.subject?.trim() || `Belge: ${doc.title}`;
    const messageBody = opts.message?.trim() ?? '';
    const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#FAF8F4;font-family:Inter,system-ui,sans-serif;color:#14141A;">
  <div style="max-width:600px;margin:0 auto;background:#fff;padding:32px 28px;border:1px solid #E5E2DD;border-radius:8px;">
    <p style="font-size:10px;letter-spacing:0.4em;color:#C9A96E;text-transform:uppercase;margin:0 0 16px;">Hazal Muti Real Estate</p>
    <h1 style="font-size:18px;font-weight:500;margin:0 0 16px;">${this.escapeHtml(doc.title)}</h1>
    ${
      messageBody
        ? `<p style="font-size:14px;line-height:1.6;color:#3a3a40;margin:0 0 16px;white-space:pre-line;">${this.escapeHtml(
            messageBody,
          )}</p>`
        : ''
    }
    <p style="font-size:13px;color:#6E6E73;margin:24px 0 0;">📎 Ekteki belgeyi bulabilirsiniz: <strong>${this.escapeHtml(
      doc.fileName,
    )}</strong></p>
  </div>
</body></html>`;

    await this.email.send({
      to: opts.to,
      subject,
      html,
      text: `${doc.title}\n\n${messageBody}\n\nEkteki belge: ${doc.fileName}`,
      attachments: [
        {
          filename: doc.fileName,
          content,
          contentType: doc.mimeType || undefined,
        },
      ],
    });

    return { ok: true };
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
