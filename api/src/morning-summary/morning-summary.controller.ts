import {
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MorningSummaryService } from './morning-summary.service';

@ApiTags('morning-summary')
@Controller()
export class MorningSummaryController {
  constructor(
    private readonly summary: MorningSummaryService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Cron-driven endpoint. Called by VPS crontab daily at 09:00 (Turkey time).
   *   0 9 * * * curl -fsSL -X POST -H "x-cron-secret: $CRON_SECRET" \
   *       https://api.hazalmuti.com/api/cron/morning-summary
   *
   * Sends an email + push to admin with today's appointments, hot inquiries,
   * stale draft listings, and unread chat count.
   */
  @Post('cron/morning-summary')
  async runCron(@Headers('x-cron-secret') secret: string) {
    const expected = this.config.get<string>('CRON_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid or missing x-cron-secret header');
    }
    return this.summary.run();
  }

  /** Admin-triggered manual run (test). */
  @Post('admin/morning-summary/run')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async manualRun() {
    return this.summary.run();
  }

  /** Just compute & return summary, no email/push. For dashboard preview. */
  @Get('admin/morning-summary/preview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async preview() {
    return this.summary.build();
  }
}
