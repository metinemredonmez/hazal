import { Controller, Get, Headers, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller()
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Cron-driven endpoint. Protect with a shared secret in `x-cron-secret` header
   * (set CRON_SECRET in env). Designed to be called from a system crontab on
   * the 1st of each month, e.g.:
   *   5 9 1 * * curl -fsSL -X POST -H "x-cron-secret: $CRON_SECRET" \
   *       https://api.hazalmuti.com/api/cron/monthly-report
   */
  @Post('cron/monthly-report')
  async runMonthlyCron(
    @Headers('x-cron-secret') secret: string,
    @Query('force') force?: string,
  ) {
    const expected = this.config.get<string>('CRON_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid or missing x-cron-secret header');
    }
    return this.reports.generateMonthly({ force: force === 'true' });
  }

  /** Admin-triggered manual run (e.g., test from UI). */
  @Post('admin/reports/monthly')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async runMonthly(@Query('force') force?: string) {
    return this.reports.generateMonthly({ force: force === 'true' });
  }

  /** Admin: list past report runs */
  @Get('admin/reports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async list() {
    return this.reports.listRuns();
  }
}
