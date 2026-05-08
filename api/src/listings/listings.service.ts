import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ListingStatus, type Listing, type ListingImage } from '@prisma/client';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly config: ConfigService,
  ) {}

  /** Best-effort auto push when a listing becomes ACTIVE. Never throws. */
  private async autoPushOnPublish(listing: Listing & { images?: ListingImage[] }) {
    if (listing.status !== ListingStatus.ACTIVE) return;
    if (!this.push.isConfigured()) return;
    try {
      const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'https://hazalmuti.com';
      const url = `${frontendUrl}/ilanlar/${listing.slug}`;
      const cover = listing.images?.find((i) => i.isPrimary)?.url ?? listing.images?.[0]?.url;
      const priceStr = new Intl.NumberFormat('tr-TR').format(Number(listing.price));
      const location = listing.district ?? listing.city ?? '';
      const tag = location ? `${location} · ` : '';
      await this.push.send({
        titleTr: `Yeni ilan: ${listing.titleTr}`,
        titleEn: `New listing: ${listing.titleEn}`,
        bodyTr: `${tag}${priceStr} ${listing.currency}`,
        bodyEn: `${tag}${priceStr} ${listing.currency}`,
        url,
        imageUrl: cover,
      });
      this.logger.log(`Auto-push sent for listing ${listing.id} (${listing.slug})`);
    } catch (err) {
      this.logger.warn(`Auto-push failed for listing ${listing.id}: ${(err as Error).message}`);
    }
  }

  private buildSort(sort?: string): Prisma.ListingOrderByWithRelationInput[] {
    switch (sort) {
      case 'oldest':
        return [{ createdAt: 'asc' }];
      case 'price-asc':
        return [{ price: 'asc' }];
      case 'price-desc':
        return [{ price: 'desc' }];
      case 'newest':
      default:
        return [{ featured: 'desc' }, { createdAt: 'desc' }];
    }
  }

  private buildFilters(query: QueryListingsDto, publicOnly: boolean): Prisma.ListingWhereInput {
    const where: Prisma.ListingWhereInput = {};
    if (publicOnly) where.status = ListingStatus.ACTIVE;
    else if (query.status) where.status = query.status;

    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (query.city) where.city = { equals: query.city, mode: 'insensitive' };
    if (query.district) where.district = { equals: query.district, mode: 'insensitive' };
    if (query.minBedrooms != null) where.bedrooms = { gte: query.minBedrooms };
    if (query.featured === 'true') where.featured = true;

    if (query.minPrice != null || query.maxPrice != null) {
      where.price = {};
      if (query.minPrice != null) (where.price as any).gte = query.minPrice;
      if (query.maxPrice != null) (where.price as any).lte = query.maxPrice;
    }

    if (query.q) {
      where.OR = [
        { titleTr: { contains: query.q, mode: 'insensitive' } },
        { titleEn: { contains: query.q, mode: 'insensitive' } },
        { descriptionTr: { contains: query.q, mode: 'insensitive' } },
        { descriptionEn: { contains: query.q, mode: 'insensitive' } },
        { city: { contains: query.q, mode: 'insensitive' } },
        { district: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async list(query: QueryListingsDto, opts: { publicOnly: boolean }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.buildFilters(query, opts.publicOnly);

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        orderBy: this.buildSort(query.sort),
        include: { images: { orderBy: { order: 'asc' } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async featured(limit = 6) {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.ACTIVE, featured: true },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getBySlugPublic(slug: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      throw new NotFoundException('Listing not found');
    }
    await this.prisma.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } });
    return { ...listing, views: listing.views + 1 };
  }

  async getById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  private async generateUniqueSlug(base: string, ignoreId?: string): Promise<string> {
    const baseSlug = slugify(base, { lower: true, strict: true, trim: true }) || 'listing';
    let candidate = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.listing.findUnique({ where: { slug: candidate } });
      if (!existing || existing.id === ignoreId) return candidate;
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }
  }

  async create(dto: CreateListingDto) {
    const slug = await this.generateUniqueSlug(dto.titleEn || dto.titleTr);
    const created = await this.prisma.listing.create({
      data: { ...dto, slug },
      include: { images: true },
    });
    // Fire-and-forget auto push on publish
    void this.autoPushOnPublish(created);
    return created;
  }

  async update(id: string, dto: UpdateListingDto) {
    const existing = await this.prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Listing not found');

    const titleChanged =
      (dto.titleEn && dto.titleEn !== existing.titleEn) ||
      (dto.titleTr && dto.titleTr !== existing.titleTr);

    const data: Prisma.ListingUpdateInput = { ...dto };
    if (titleChanged) {
      data.slug = await this.generateUniqueSlug(dto.titleEn || dto.titleTr || existing.titleEn, id);
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data,
      include: { images: { orderBy: { order: 'asc' } } },
    });

    // Auto-push only on the DRAFT→ACTIVE transition (not on every edit of an ACTIVE listing)
    const becamePublished =
      existing.status !== ListingStatus.ACTIVE && updated.status === ListingStatus.ACTIVE;
    if (becamePublished) {
      void this.autoPushOnPublish(updated);
    }

    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Listing not found');
    await this.prisma.listing.delete({ where: { id } });
    return { ok: true };
  }

  async duplicate(id: string) {
    const existing = await this.prisma.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    if (!existing) throw new NotFoundException('Listing not found');

    const copyTitleTr = `${existing.titleTr} (Kopya)`;
    const copyTitleEn = `${existing.titleEn} (Copy)`;
    const slug = await this.generateUniqueSlug(copyTitleEn);

    const { id: _id, slug: _slug, createdAt, updatedAt, views, images, ...rest } = existing;

    const created = await this.prisma.listing.create({
      data: {
        ...rest,
        slug,
        titleTr: copyTitleTr,
        titleEn: copyTitleEn,
        status: 'DRAFT',
        featured: false,
        views: 0,
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            order: idx,
            isPrimary: img.isPrimary,
          })),
        },
      },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    return created;
  }

  async bulkUpdate(ids: string[], patch: { status?: any; featured?: boolean }) {
    if (!ids || ids.length === 0) return { ok: true, updated: 0 };

    // Snapshot pre-update statuses to detect DRAFT→ACTIVE transitions
    const before = patch.status === ListingStatus.ACTIVE
      ? await this.prisma.listing.findMany({
          where: { id: { in: ids } },
          select: { id: true, status: true },
        })
      : [];

    const data: Prisma.ListingUpdateManyMutationInput = {};
    if (patch.status !== undefined) data.status = patch.status;
    if (patch.featured !== undefined) data.featured = patch.featured;
    const result = await this.prisma.listing.updateMany({
      where: { id: { in: ids } },
      data,
    });

    // Auto-push for listings that just became ACTIVE
    if (patch.status === ListingStatus.ACTIVE && before.length > 0) {
      const transitioned = before.filter((l) => l.status !== ListingStatus.ACTIVE).map((l) => l.id);
      if (transitioned.length > 0) {
        const pubs = await this.prisma.listing.findMany({
          where: { id: { in: transitioned } },
          include: { images: { orderBy: { order: 'asc' } } },
        });
        for (const l of pubs) void this.autoPushOnPublish(l);
      }
    }

    return { ok: true, updated: result.count };
  }

  async bulkDelete(ids: string[]) {
    if (!ids || ids.length === 0) return { ok: true, deleted: 0 };
    const result = await this.prisma.listing.deleteMany({ where: { id: { in: ids } } });
    return { ok: true, deleted: result.count };
  }

  async addImages(listingId: string, urls: string[]) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { images: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const startOrder = listing.images.length;
    const created = await this.prisma.$transaction(
      urls.map((url, idx) =>
        this.prisma.listingImage.create({
          data: {
            listingId,
            url,
            order: startOrder + idx,
            isPrimary: listing.images.length === 0 && idx === 0,
          },
        }),
      ),
    );
    return created;
  }

  async removeImage(listingId: string, imageId: string) {
    const image = await this.prisma.listingImage.findUnique({ where: { id: imageId } });
    if (!image || image.listingId !== listingId) {
      throw new NotFoundException('Image not found');
    }
    await this.prisma.listingImage.delete({ where: { id: imageId } });
    return { ok: true };
  }

  async setPrimaryImage(listingId: string, imageId: string) {
    const image = await this.prisma.listingImage.findUnique({ where: { id: imageId } });
    if (!image || image.listingId !== listingId) {
      throw new NotFoundException('Image not found');
    }
    await this.prisma.$transaction([
      this.prisma.listingImage.updateMany({
        where: { listingId },
        data: { isPrimary: false },
      }),
      this.prisma.listingImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
    return { ok: true };
  }

  async reorderImages(listingId: string, imageIds: string[]) {
    const images = await this.prisma.listingImage.findMany({ where: { listingId } });
    const idSet = new Set(images.map((i) => i.id));
    if (imageIds.length !== images.length || !imageIds.every((id) => idSet.has(id))) {
      throw new BadRequestException('Image IDs do not match listing images');
    }

    await this.prisma.$transaction(
      imageIds.map((id, idx) =>
        this.prisma.listingImage.update({
          where: { id },
          data: { order: idx, isPrimary: idx === 0 },
        }),
      ),
    );
    return { ok: true };
  }

  async timeseries(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const inquiriesRaw = await this.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "Inquiry"
      WHERE "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `;
    const listingsRaw = await this.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "Listing"
      WHERE "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `;

    const inquiries = inquiriesRaw.map((r) => ({
      date: new Date(r.day).toISOString().slice(0, 10),
      count: Number(r.count),
    }));
    const listingsCreated = listingsRaw.map((r) => ({
      date: new Date(r.day).toISOString().slice(0, 10),
      count: Number(r.count),
    }));

    const inquiriesByStatus = await this.prisma.inquiry.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const fillSeries = (series: Array<{ date: string; count: number }>) => {
      const map = new Map(series.map((s) => [s.date, s.count]));
      return dates.map((d) => ({ date: d, count: map.get(d) ?? 0 }));
    };

    return {
      days,
      since: since.toISOString(),
      inquiries: fillSeries(inquiries),
      listingsCreated: fillSeries(listingsCreated),
      inquiriesByStatus: inquiriesByStatus.map((r) => ({
        status: r.status,
        count: r._count._all,
      })),
    };
  }

  async stats() {
    const [total, active, draft, sold, rented, featured, totalViews] = await Promise.all([
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
      this.prisma.listing.count({ where: { status: ListingStatus.DRAFT } }),
      this.prisma.listing.count({ where: { status: ListingStatus.SOLD } }),
      this.prisma.listing.count({ where: { status: ListingStatus.RENTED } }),
      this.prisma.listing.count({ where: { featured: true } }),
      this.prisma.listing.aggregate({ _sum: { views: true } }),
    ]);

    const topViewed = await this.prisma.listing.findMany({
      where: { status: ListingStatus.ACTIVE },
      orderBy: { views: 'desc' },
      take: 5,
      select: { id: true, slug: true, titleEn: true, titleTr: true, views: true },
    });

    return {
      total,
      active,
      draft,
      sold,
      rented,
      featured,
      totalViews: totalViews._sum.views ?? 0,
      topViewed,
    };
  }
}
