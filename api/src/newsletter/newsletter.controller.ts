import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Request } from 'express';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class SubscribeDto {
  @IsEmail()
  email: string;

  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsIn(['tr', 'en']) locale?: 'tr' | 'en';
  @IsOptional() @IsString() @MaxLength(50) source?: string;
}

/** Public — anyone can subscribe */
@ApiTags('newsletter (public)')
@Controller('newsletter')
export class NewsletterPublicController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto, @Req() req: Request) {
    return this.newsletter.subscribe({
      email: dto.email,
      name: dto.name,
      locale: dto.locale,
      source: dto.source ?? 'web',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] ?? undefined,
    });
  }
}

/** Admin — list, stats, unsubscribe, delete */
@ApiTags('newsletter (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/newsletter')
export class NewsletterAdminController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('includeUnsubscribed') includeUnsubscribed?: string,
  ) {
    return this.newsletter.list({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      includeUnsubscribed: includeUnsubscribed === 'true',
    });
  }

  @Get('stats')
  stats() {
    return this.newsletter.stats();
  }

  @Patch(':id/unsubscribe')
  unsubscribe(@Param('id') id: string) {
    return this.newsletter.unsubscribe(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsletter.remove(id);
  }
}
