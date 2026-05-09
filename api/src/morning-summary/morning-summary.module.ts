import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PushModule } from '../push/push.module';
import { MorningSummaryService } from './morning-summary.service';
import { MorningSummaryController } from './morning-summary.controller';

@Module({
  imports: [AuthModule, NotificationsModule, PushModule],
  providers: [MorningSummaryService],
  controllers: [MorningSummaryController],
  exports: [MorningSummaryService],
})
export class MorningSummaryModule {}
