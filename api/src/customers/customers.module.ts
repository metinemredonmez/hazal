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

  /**
   * Müşteri timeline'ı — tüm aktiviteleri birleşik tarih sırasıyla.
   * Inquiry, Appointment, EmailMessage (to/from match), Document (customerName match),
   * VisitedLocation (customerName match), ChatSession (visitorEmail match)
   */
  async timeline(id: string) {
    const customer = await this.findById(id);
    const email = customer.email?.toLowerCase();
    const name = customer.name;

    // Parallel fetch: emails (by address), documents+visits (by name), chats (by email)
    type EmailEvent = {
      id: string;
      direction: 'INBOUND' | 'OUTBOUND';
      subject: string;
      fromAddress: string;
      receivedAt: Date;
      hasAttachment: boolean;
    };
    type ChatEvent = {
      id: string;
      channel: string;
      updatedAt: Date;
      messages: Array<{ content: string; createdAt: Date; sender: string }>;
    };

    const [emails, documents, visits, chats] = (await Promise.all([
      email
        ? this.prisma.emailMessage.findMany({
            where: {
              OR: [
                { fromAddress: { contains: email, mode: 'insensitive' } },
                { toAddresses: { contains: email, mode: 'insensitive' } },
              ],
            },
            orderBy: { receivedAt: 'desc' },
            take: 50,
            select: {
              id: true,
              direction: true,
              subject: true,
              fromAddress: true,
              receivedAt: true,
              hasAttachment: true,
            },
          })
        : Promise.resolve([] as EmailEvent[]),
      this.prisma.document.findMany({
        where: { customerName: { equals: name, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          category: true,
          fileName: true,
          createdAt: true,
        },
      }),
      this.prisma.visitedLocation.findMany({
        where: { customerName: { equals: name, mode: 'insensitive' } },
        orderBy: { visitedAt: 'desc' },
        select: {
          id: true,
          label: true,
          notes: true,
          lat: true,
          lng: true,
          visitedAt: true,
        },
      }),
      email
        ? this.prisma.chatSession.findMany({
            where: { visitorEmail: { equals: email, mode: 'insensitive' } },
            orderBy: { updatedAt: 'desc' },
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { content: true, createdAt: true, sender: true },
              },
            },
            take: 20,
          })
        : Promise.resolve([] as ChatEvent[]),
    ])) as [EmailEvent[], unknown[], unknown[], ChatEvent[]];

    // Build merged timeline events
    type Event = {
      type: 'inquiry' | 'appointment' | 'email' | 'document' | 'visit' | 'chat';
      at: Date;
      title: string;
      summary?: string;
      icon?: string;
      meta?: Record<string, unknown>;
    };

    const events: Event[] = [];

    customer.inquiries.forEach((i) =>
      events.push({
        type: 'inquiry',
        at: i.createdAt,
        title: 'Talep',
        summary: i.message ?? undefined,
        meta: {
          status: i.status,
          listing: i.listing?.titleTr,
          listingSlug: i.listing?.slug,
        },
      }),
    );

    customer.appointments.forEach((a) =>
      events.push({
        type: 'appointment',
        at: a.startsAt,
        title: `Randevu — ${a.status}`,
        summary: a.notes ?? undefined,
        meta: {
          listing: a.listing?.titleTr,
          listingSlug: a.listing?.slug,
          duration: a.durationMin,
          location: a.location,
        },
      }),
    );

    emails.forEach((e) =>
      events.push({
        type: 'email',
        at: e.receivedAt,
        title:
          e.direction === 'INBOUND'
            ? `📥 Gelen: ${e.subject}`
            : `📤 Giden: ${e.subject}`,
        summary: e.fromAddress,
        meta: {
          id: e.id,
          attachment: e.hasAttachment,
        },
      }),
    );

    documents.forEach((d) =>
      events.push({
        type: 'document',
        at: d.createdAt,
        title: `📄 Belge: ${d.title}`,
        summary: d.fileName,
        meta: {
          id: d.id,
          category: d.category,
        },
      }),
    );

    visits.forEach((v) =>
      events.push({
        type: 'visit',
        at: v.visitedAt,
        title: `📍 Ziyaret: ${v.label ?? 'Konum'}`,
        summary: v.notes ?? undefined,
        meta: {
          lat: v.lat,
          lng: v.lng,
        },
      }),
    );

    chats.forEach((c) => {
      const last = c.messages[0];
      if (!last) return;
      events.push({
        type: 'chat',
        at: c.updatedAt,
        title: '💬 Sohbet',
        summary: last.content,
        meta: {
          id: c.id,
          channel: c.channel,
        },
      });
    });

    // Sort newest first
    events.sort((a, b) => b.at.getTime() - a.at.getTime());

    return {
      customer,
      counts: {
        inquiries: customer.inquiries.length,
        appointments: customer.appointments.length,
        emails: emails.length,
        documents: documents.length,
        visits: visits.length,
        chats: chats.length,
      },
      events,
    };
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

  @Get(':id/timeline')
  timeline(@Param('id') id: string) {
    return this.customers.timeline(id);
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
