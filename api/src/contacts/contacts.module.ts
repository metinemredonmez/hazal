import { Module } from '@nestjs/common';
import { BadRequestException, Body, Controller, Delete, Get, Injectable, NotFoundException, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Lightweight CSV line parser supporting quoted values.
 * (We don't pull a full CSV library to keep deps minimal.)
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === ',' || ch === ';' || ch === '\t') {
        out.push(cur);
        cur = '';
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

interface ImportContactInput {
  name: string;
  phone?: string;
  altPhone?: string;
  email?: string;
  company?: string;
  role?: string;
  category?: string;
  notes?: string;
  tags?: string[];
}

interface ImportResult {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: Array<{ row: number; reason: string }>;
}

@Injectable()
class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ContactCreateInput) {
    return this.prisma.contact.create({ data });
  }

  async bulkImport(rows: ImportContactInput[]): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, skipped: 0, duplicates: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.name || !r.name.trim()) {
        result.errors.push({ row: i + 1, reason: 'Ad boş' });
        result.skipped++;
        continue;
      }

      // Dedup: same phone OR same email
      const existing = await this.prisma.contact.findFirst({
        where: {
          OR: [
            r.phone ? { phone: r.phone } : undefined,
            r.email ? { email: r.email } : undefined,
          ].filter(Boolean) as Prisma.ContactWhereInput[],
        },
      });
      if (existing) {
        result.duplicates++;
        continue;
      }

      try {
        await this.prisma.contact.create({
          data: {
            name: r.name.trim(),
            phone: r.phone?.trim() || null,
            altPhone: r.altPhone?.trim() || null,
            email: r.email?.trim() || null,
            company: r.company?.trim() || null,
            role: r.role?.trim() || null,
            category: r.category?.trim() || null,
            notes: r.notes?.trim() || null,
            tags: r.tags ?? [],
          },
        });
        result.imported++;
      } catch (err) {
        result.errors.push({ row: i + 1, reason: (err as Error).message });
        result.skipped++;
      }
    }
    return result;
  }

  parseCsv(text: string): ImportContactInput[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Detect header by checking if first row contains known field names
    const firstRow = parseCsvLine(lines[0]);
    const lower = firstRow.map((c) => c.toLowerCase().trim());
    const hasHeader = lower.some((c) =>
      ['name', 'ad', 'isim', 'phone', 'telefon', 'email', 'eposta'].includes(c),
    );

    let headers: string[];
    let dataLines: string[];
    if (hasHeader) {
      headers = lower;
      dataLines = lines.slice(1);
    } else {
      headers = ['name', 'phone', 'email', 'company', 'role', 'category', 'notes'];
      dataLines = lines;
    }

    const fieldMap: Record<string, keyof ImportContactInput> = {
      name: 'name',
      ad: 'name',
      isim: 'name',
      phone: 'phone',
      telefon: 'phone',
      cep: 'phone',
      altphone: 'altPhone',
      'alt phone': 'altPhone',
      'alt telefon': 'altPhone',
      email: 'email',
      eposta: 'email',
      'e-posta': 'email',
      mail: 'email',
      company: 'company',
      sirket: 'company',
      şirket: 'company',
      firma: 'company',
      role: 'role',
      gorev: 'role',
      görev: 'role',
      meslek: 'role',
      category: 'category',
      kategori: 'category',
      notes: 'notes',
      not: 'notes',
      notlar: 'notes',
    };

    return dataLines.map((line) => {
      const cells = parseCsvLine(line);
      const out: ImportContactInput = { name: '' };
      headers.forEach((h, i) => {
        const key = fieldMap[h];
        if (!key || !cells[i]) return;
        (out as unknown as Record<string, string>)[key] = cells[i];
      });
      return out;
    });
  }

  parseVCard(text: string): ImportContactInput[] {
    const cards = text.split(/BEGIN:VCARD/i).slice(1);
    return cards
      .map((card) => {
        const block = card.split(/END:VCARD/i)[0];
        const lines = block.split(/\r?\n/);
        const out: ImportContactInput = { name: '' };
        for (const raw of lines) {
          const line = raw.trim();
          if (!line) continue;
          const sepIdx = line.indexOf(':');
          if (sepIdx < 0) continue;
          const keyPart = line.slice(0, sepIdx).split(';')[0].toUpperCase();
          const value = line.slice(sepIdx + 1).trim();
          if (!value) continue;

          if (keyPart === 'FN' && !out.name) out.name = value;
          else if (keyPart === 'N' && !out.name) {
            // N:Last;First;Middle;Prefix;Suffix
            const parts = value.split(';');
            out.name = `${parts[1] ?? ''} ${parts[0] ?? ''}`.trim();
          } else if (keyPart === 'TEL') {
            if (!out.phone) out.phone = value;
            else if (!out.altPhone) out.altPhone = value;
          } else if (keyPart === 'EMAIL' && !out.email) {
            out.email = value;
          } else if (keyPart === 'ORG' && !out.company) {
            out.company = value.split(';')[0].trim();
          } else if (keyPart === 'TITLE' && !out.role) {
            out.role = value;
          } else if (keyPart === 'NOTE' && !out.notes) {
            out.notes = value;
          }
        }
        return out;
      })
      .filter((c) => c.name);
  }

  async list(opts: { page?: number; pageSize?: number; category?: string; search?: string; favorite?: boolean } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 100;
    const where: Prisma.ContactWhereInput = {};
    if (opts.category) where.category = opts.category;
    if (opts.favorite !== undefined) where.favorite = opts.favorite;
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { phone: { contains: opts.search } },
        { email: { contains: opts.search, mode: 'insensitive' } },
        { company: { contains: opts.search, mode: 'insensitive' } },
        { role: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: [{ favorite: 'desc' }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.contact.count({ where }),
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const c = await this.prisma.contact.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Contact not found');
    return c;
  }

  async update(id: string, data: Prisma.ContactUpdateInput) {
    return this.prisma.contact.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.contact.delete({ where: { id } });
    return { ok: true };
  }
}

class CreateContactDto {
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() altPhone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsBoolean() favorite?: boolean;
}

class ImportTextDto {
  @IsString() text!: string;
}

class UpdateContactDto extends CreateContactDto {
  @IsOptional() @IsString() declare name: string;
}

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/contacts')
class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('favorite') favorite?: string,
  ) {
    return this.contacts.list({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 100,
      category,
      search,
      favorite: favorite === 'true' ? true : favorite === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.contacts.findById(id);
  }

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contacts.create(dto as Prisma.ContactCreateInput);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contacts.update(id, dto as Prisma.ContactUpdateInput);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contacts.remove(id);
  }

  @Post('import/csv')
  importCsv(@Body() dto: ImportTextDto) {
    if (!dto.text) throw new BadRequestException('text alanı gerekli');
    const rows = this.contacts.parseCsv(dto.text);
    if (rows.length === 0) throw new BadRequestException('CSV içinde geçerli satır yok');
    return this.contacts.bulkImport(rows);
  }

  @Post('import/vcard')
  importVcard(@Body() dto: ImportTextDto) {
    if (!dto.text) throw new BadRequestException('text alanı gerekli');
    const rows = this.contacts.parseVCard(dto.text);
    if (rows.length === 0) throw new BadRequestException('vCard içinde geçerli kişi yok');
    return this.contacts.bulkImport(rows);
  }
}

@Module({
  imports: [AuthModule],
  providers: [ContactsService],
  controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
