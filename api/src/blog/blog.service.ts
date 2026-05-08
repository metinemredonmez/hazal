import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, BlogPostStatus } from '@prisma/client';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(base: string, ignoreId?: string): Promise<string> {
    const baseSlug = slugify(base, { lower: true, strict: true, trim: true }) || 'post';
    let candidate = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.blogPost.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === ignoreId) return candidate;
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }
  }

  async listPublic(page = 1, pageSize = 12, kind?: string) {
    const where: Prisma.BlogPostWhereInput = { status: BlogPostStatus.PUBLISHED };
    if (kind) where.kind = kind as 'ARTICLE' | 'PRESS' | 'VIDEO';
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async getPublicBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }
    await this.prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
    return { ...post, views: post.views + 1 };
  }

  async listAdmin(page = 1, pageSize = 50) {
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.blogPost.count(),
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async getById(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(dto: {
    titleTr: string;
    titleEn: string;
    excerptTr?: string;
    excerptEn?: string;
    bodyTr?: string;
    bodyEn?: string;
    kind?: 'ARTICLE' | 'PRESS' | 'VIDEO';
    status?: 'DRAFT' | 'PUBLISHED';
    coverImage?: string;
    externalUrl?: string;
  }) {
    const slug = await this.generateUniqueSlug(dto.titleEn || dto.titleTr);
    const publishedAt = dto.status === 'PUBLISHED' ? new Date() : null;
    return this.prisma.blogPost.create({
      data: {
        slug,
        titleTr: dto.titleTr,
        titleEn: dto.titleEn,
        excerptTr: dto.excerptTr,
        excerptEn: dto.excerptEn,
        bodyTr: dto.bodyTr ?? '',
        bodyEn: dto.bodyEn ?? '',
        kind: dto.kind ?? 'ARTICLE',
        status: dto.status ?? 'DRAFT',
        coverImage: dto.coverImage,
        externalUrl: dto.externalUrl,
        publishedAt,
      },
    });
  }

  async update(id: string, dto: Partial<Prisma.BlogPostUpdateInput> & { regenerateSlug?: boolean }) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');
    const data: Prisma.BlogPostUpdateInput = { ...dto };
    delete (data as Record<string, unknown>).regenerateSlug;
    if (
      dto.regenerateSlug ||
      (typeof dto.titleEn === 'string' && dto.titleEn !== existing.titleEn)
    ) {
      const titleEn = (dto.titleEn as string | undefined) ?? existing.titleEn;
      data.slug = await this.generateUniqueSlug(titleEn, id);
    }
    if (dto.status === 'PUBLISHED' && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { ok: true };
  }
}
