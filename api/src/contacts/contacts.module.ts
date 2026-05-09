import { Module } from '@nestjs/common';
import { Body, Controller, Delete, Get, Injectable, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ContactCreateInput) {
    return this.prisma.contact.create({ data });
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
}

@Module({
  imports: [AuthModule],
  providers: [ContactsService],
  controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
