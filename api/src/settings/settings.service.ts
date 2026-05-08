import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } });
    if (existing) return existing;
    return this.prisma.siteSettings.create({ data: { id: SINGLETON_ID } });
  }

  async update(dto: UpdateSettingsDto) {
    // Prisma JSON column wants InputJsonValue; our typed PageContent shape
    // needs an explicit cast (no index signature on the interface).
    const data = dto as unknown as Prisma.SiteSettingsUpdateInput;
    const createData = { id: SINGLETON_ID, ...dto } as unknown as Prisma.SiteSettingsCreateInput;
    return this.prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      create: createData,
      update: data,
    });
  }

  async getPublic() {
    const settings = await this.get();
    // strip secrets/admin-only fields if any (mapboxToken is needed by frontend, so keep it)
    return settings;
  }
}
