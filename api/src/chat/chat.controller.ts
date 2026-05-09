import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatChannel } from '@prisma/client';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('chat')
@Controller()
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  // Public — visitor pulls their own history before connecting WS
  @Get('chat/history')
  async history(@Query('visitorId') visitorId: string) {
    if (!visitorId) return { session: null, messages: [] };
    const session = await this.chat.getSessionByVisitor(visitorId);
    return session ?? { session: null, messages: [] };
  }

  // Admin
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/chat/sessions')
  list(@Query('closed') closed?: string, @Query('channel') channel?: string) {
    const closedFilter = closed === 'true' ? true : closed === 'false' ? false : undefined;
    return this.chat.listSessions({ closed: closedFilter, channel: channel || undefined });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/chat/unread-count')
  unread() {
    return this.chat.unreadCount().then((count) => ({ count }));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/chat/channel-stats')
  channelStats() {
    return this.chat.channelStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/chat/sessions/:id')
  getOne(@Param('id') id: string) {
    return this.chat.getSessionById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/chat/sessions/:id/read')
  markRead(@Param('id') id: string) {
    return this.chat.markRead(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('admin/chat/sessions/:id/close')
  close(@Param('id') id: string) {
    return this.chat.closeSession(id);
  }

  /** Manuel kayıt — telefon konuşması, dış kanal vs. (PHONE / OTHER / EMAIL). */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/chat/sessions/manual')
  createManual(
    @Body()
    body: {
      channel: ChatChannel;
      visitorName?: string;
      visitorPhone?: string;
      visitorEmail?: string;
      note: string;
    },
  ) {
    return this.chat.createManualSession({
      channel: body.channel,
      visitorName: body.visitorName,
      visitorPhone: body.visitorPhone,
      visitorEmail: body.visitorEmail,
      note: body.note,
    });
  }

  /** Mevcut session'a admin notu ekle (manuel takip). */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin/chat/sessions/:id/note')
  addNote(@Param('id') id: string, @Body() body: { note: string }) {
    return this.chat.appendAdminNote(id, body.note);
  }
}
