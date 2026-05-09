import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
class VisitedLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(opts: { from?: Date; to?: Date; limit?: number } = {}) {
    const where: Prisma.VisitedLocationWhereInput = {};
    if (opts.from || opts.to) {
      where.visitedAt = {};
      if (opts.from) (where.visitedAt as Prisma.DateTimeFilter).gte = opts.from;
      if (opts.to) (where.visitedAt as Prisma.DateTimeFilter).lte = opts.to;
    }
    return this.prisma.visitedLocation.findMany({
      where,
      orderBy: { visitedAt: 'desc' },
      take: opts.limit ?? 200,
    });
  }

  create(data: Prisma.VisitedLocationCreateInput) {
    return this.prisma.visitedLocation.create({ data });
  }

  async update(id: string, data: Prisma.VisitedLocationUpdateInput) {
    const existing = await this.prisma.visitedLocation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Location not found');
    return this.prisma.visitedLocation.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.visitedLocation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Location not found');
    await this.prisma.visitedLocation.delete({ where: { id } });
    return { ok: true };
  }
}

class CreateVisitDto {
  @IsLatitude() lat!: number;
  @IsLongitude() lng!: number;
  @IsOptional() @IsString() @MaxLength(200) label?: string;
  @IsOptional() @IsString() @MaxLength(200) customerName?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsString() appointmentId?: string;
}

class UpdateVisitDto {
  @IsOptional() @IsString() @MaxLength(200) label?: string;
  @IsOptional() @IsString() @MaxLength(200) customerName?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

@ApiTags('visited-locations (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/visited-locations')
class VisitedLocationsController {
  constructor(private readonly service: VisitedLocationsService) {}

  @Get()
  list(@Query('from') from?: string, @Query('to') to?: string, @Query('limit') limit?: string) {
    return this.service.list({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateVisitDto) {
    return this.service.create(dto as Prisma.VisitedLocationCreateInput);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVisitDto) {
    return this.service.update(id, dto as Prisma.VisitedLocationUpdateInput);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

@Module({
  imports: [AuthModule],
  providers: [VisitedLocationsService],
  controllers: [VisitedLocationsController],
  exports: [VisitedLocationsService],
})
export class VisitedLocationsModule {}
