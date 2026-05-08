import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.svc.list({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  unread() {
    return this.svc.unreadCount().then((count) => ({ count }));
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }

  @Post('read-all')
  markAllRead() {
    return this.svc.markAllRead();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
