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
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { MailboxService } from './mailbox.service';
import { ImapFetcherService } from './imap-fetcher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class SendMailDto {
  @IsEmail() to: string;
  @IsOptional() @IsString() cc?: string;
  @IsString() @MaxLength(300) subject: string;
  @IsOptional() @IsString() bodyText?: string;
  @IsOptional() @IsString() bodyHtml?: string;
  @IsOptional() @IsString() inReplyTo?: string;
}

@ApiTags('mail (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/mail')
export class MailController {
  constructor(
    private readonly mailbox: MailboxService,
    private readonly fetcher: ImapFetcherService,
  ) {}

  @Get('inbox')
  inbox(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    return this.mailbox.list({
      direction: 'INBOUND',
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 30,
      search,
    });
  }

  @Get('sent')
  sent(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    return this.mailbox.list({
      direction: 'OUTBOUND',
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 30,
      search,
    });
  }

  @Get('unread-count')
  async unreadCount() {
    return { count: await this.mailbox.unreadCount() };
  }

  @Get('status')
  status() {
    return { imapConfigured: this.fetcher.isConfigured() };
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.mailbox.findById(id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.mailbox.markRead(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mailbox.softDelete(id);
  }

  @Post('refresh')
  refresh() {
    return this.fetcher.fetchInbox();
  }

  @Post('send')
  send(@Body() dto: SendMailDto) {
    return this.mailbox.send(dto);
  }
}
