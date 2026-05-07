import { Injectable } from '@nestjs/common';
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
    return this.prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, ...dto },
      update: dto,
    });
  }

  async getPublic() {
    const settings = await this.get();
    // strip secrets/admin-only fields if any (mapboxToken is needed by frontend, so keep it)
    return settings;
  }
}
