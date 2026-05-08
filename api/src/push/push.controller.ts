import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PushService } from './push.service';
import { SendPushDto } from './dto/send-push.dto';

@ApiTags('push (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Get('status')
  status() {
    return { configured: this.push.isConfigured() };
  }

  @Post('send')
  send(@Body() dto: SendPushDto) {
    return this.push.send(dto);
  }
}
