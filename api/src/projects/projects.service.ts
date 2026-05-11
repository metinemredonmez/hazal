import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface ProjectInput {
  slug?: string;
  brandTr?: string;
  brandEn?: string;
  nameTr: string;
  nameEn: string;
  taglineTr?: string;
  taglineEn?: string;
  locationTr?: string;
  locationEn?: string;
  descriptionTr?: string;
  descriptionEn?: string;
  heroImage?: string;
  heroVideo?: string | null;
  specs?: unknown;
  featuresTr?: string[];
  featuresEn?: string[];
  gallery?: string[];
  brochureUrl?: string | null;
  statusTr?: string;
  statusEn?: string;
  statusTone?: string;
  featured?: boolean;
  order?: number;
  isPublished?: boolean;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic() {
    return this.prisma.project.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async featured() {
    return this.prisma.project.findMany({
      where: { isPublished: true, featured: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getBySlug(slug: string) {
    const p = await this.prisma.project.findUnique({ where: { slug } });
    if (!p || !p.isPublished) throw new NotFoundException('Project not found');
    return p;
  }

  async listAdmin() {
    return this.prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getOne(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async create(input: ProjectInput) {
    const slug = input.slug?.trim() || slugify(input.nameEn || input.nameTr);
    return this.prisma.project.create({
      data: this.toData(input, slug),
    });
  }

  async update(id: string, input: ProjectInput) {
    await this.getOne(id);
    const slug = input.slug?.trim() || undefined;
    const data: Prisma.ProjectUpdateInput = this.toData(input, slug);
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.getOne(id);
    await this.prisma.project.delete({ where: { id } });
    return { ok: true };
  }

  private toData(
    i: ProjectInput,
    slug?: string,
  ): Prisma.ProjectCreateInput & Prisma.ProjectUpdateInput {
    const data: Prisma.ProjectCreateInput & Prisma.ProjectUpdateInput = {
      nameTr: i.nameTr,
      nameEn: i.nameEn,
      ...(slug && { slug }),
      brandTr: i.brandTr ?? '',
      brandEn: i.brandEn ?? '',
      taglineTr: i.taglineTr ?? '',
      taglineEn: i.taglineEn ?? '',
      locationTr: i.locationTr ?? '',
      locationEn: i.locationEn ?? '',
      descriptionTr: i.descriptionTr ?? '',
      descriptionEn: i.descriptionEn ?? '',
      heroImage: i.heroImage ?? '',
      heroVideo: i.heroVideo ?? null,
      specs: (i.specs ?? []) as Prisma.InputJsonValue,
      featuresTr: i.featuresTr ?? [],
      featuresEn: i.featuresEn ?? [],
      gallery: i.gallery ?? [],
      brochureUrl: i.brochureUrl ?? null,
      statusTr: i.statusTr ?? '',
      statusEn: i.statusEn ?? '',
      statusTone: i.statusTone ?? 'live',
      featured: i.featured ?? false,
      order: i.order ?? 0,
      isPublished: i.isPublished ?? true,
    };
    return data;
  }
}
