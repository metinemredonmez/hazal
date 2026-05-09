import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  CalendarEventStatus,
  CalendarEventType,
} from '@prisma/client';
import { CalendarEventsService } from './calendar-events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateEventDto {
  @IsEnum(CalendarEventType) type: CalendarEventType;
  @IsString() @MaxLength(200) title: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() startsAt: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsString() listingId?: string;
  @IsOptional() @IsString() inquiryId?: string;
  @IsOptional() @IsString() @MaxLength(200) customerName?: string;
  @IsOptional() @IsInt() remindBefore?: number;
  @IsOptional() @IsString() recurrence?: string;
  @IsOptional() @IsString() notes?: string;
}

class UpdateEventDto {
  @IsOptional() @IsEnum(CalendarEventType) type?: CalendarEventType;
  @IsOptional() @IsEnum(CalendarEventStatus) status?: CalendarEventStatus;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsBoolean() allDay?: boolean;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsString() listingId?: string;
  @IsOptional() @IsString() inquiryId?: string;
  @IsOptional() @IsString() @MaxLength(200) customerName?: string;
  @IsOptional() @IsInt() remindBefore?: number;
  @IsOptional() @IsString() recurrence?: string;
  @IsOptional() @IsString() notes?: string;
}

@ApiTags('calendar-events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/calendar-events')
export class CalendarEventsController {
  constructor(private readonly events: CalendarEventsService) {}

  @Get()
  list(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('listingId') listingId?: string,
  ) {
    return this.events.list({
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      type: type as CalendarEventType,
      status: status as CalendarEventStatus,
      listingId,
    });
  }

  @Get('combined')
  combined(@Query('fromDate') fromDate: string, @Query('toDate') toDate: string) {
    return this.events.listCombined(new Date(fromDate), new Date(toDate));
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.events.findById(id);
  }

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.events.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.events.update(id, {
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.events.remove(id);
  }
}
