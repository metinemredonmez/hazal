import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PushService } from './push.service';
import { SendPushDto } from './dto/send-push.dto';

class UpdatePushConfigDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() site_name?: string;
  @IsOptional() @IsString() chrome_web_origin?: string;
  @IsOptional() @IsString() chrome_web_default_notification_icon?: string;
  @IsOptional() @IsString() chrome_web_sub_domain?: string;
  @IsOptional() @IsBoolean() additional_data_is_root_payload?: boolean;
}

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

  @Get('config')
  getConfig() {
    return this.push.getAppConfig();
  }

  @Patch('config')
  updateConfig(@Body() dto: UpdatePushConfigDto) {
    return this.push.updateAppConfig(dto);
  }

  @Post('send')
  send(@Body() dto: SendPushDto) {
    return this.push.send(dto);
  }
}
