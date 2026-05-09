import { Module } from '@nestjs/common';
import { Body, Controller, Delete, Get, Injectable, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma, CustomerStatus, CustomerSource, Currency } from '@prisma/client';
import { IsArray, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CustomerCreateInput) {
    return this.prisma.customer.create({ data });
  }

  async list(opts: { page?: number; pageSize?: number; status?: CustomerStatus; search?: string } = {}) {
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 30;
    const where: Prisma.CustomerWhereInput = {};
    if (opts.status) where.status = opts.status;
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { email: { contains: opts.search, mode: 'insensitive' } },
        { phone: { contains: opts.search } },
        { notes: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { inquiries: true, appointments: true } } },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    const c = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        inquiries: {
          orderBy: { createdAt: 'desc' },
          include: { listing: { select: { titleTr: true, slug: true } } },
        },
        appointments: {
          orderBy: { startsAt: 'desc' },
          include: { listing: { select: { titleTr: true, slug: true } } },
        },
      },
    });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.customer.delete({ where: { id } });
    return { ok: true };
  }

  async stats() {
    const byStatus = await this.prisma.customer.groupBy({ by: ['status'], _count: { _all: true } });
    const total = await this.prisma.customer.count();
    return { total, byStatus: byStatus.map((r) => ({ status: r.status, count: r._count._all })) };
  }
}

class CreateCustomerDto {
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() altPhone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEnum(CustomerStatus) status?: CustomerStatus;
  @IsOptional() @IsEnum(CustomerSource) source?: CustomerSource;
  @IsOptional() @IsNumber() budget?: number;
  @IsOptional() @IsEnum(Currency) budgetCurrency?: Currency;
  @IsOptional() @IsString() preferences?: string;
  @IsOptional() @IsDateString() birthday?: string;
  @IsOptional() @IsArray() interestedIn?: string[];
  @IsOptional() @IsArray() districts?: string[];
  @IsOptional() @IsString() preferredContact?: string;
  @IsOptional() @IsInt() score?: number;
  @IsOptional() @IsString() scoreNote?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsString() notes?: string;
}

class UpdateCustomerDto extends CreateCustomerDto {
  @IsOptional() @IsString() declare name: string;
}

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/customers')
class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.customers.list({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 30,
      status: status as CustomerStatus,
      search,
    });
  }

  @Get('stats')
  stats() {
    return this.customers.stats();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.customers.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customers.create({
      ...dto,
      birthday: dto.birthday ? new Date(dto.birthday) : undefined,
    } as Prisma.CustomerCreateInput);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customers.update(id, {
      ...dto,
      birthday: dto.birthday ? new Date(dto.birthday) : undefined,
    } as Prisma.CustomerUpdateInput);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customers.remove(id);
  }
}

@Module({
  imports: [AuthModule],
  providers: [CustomersService],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
