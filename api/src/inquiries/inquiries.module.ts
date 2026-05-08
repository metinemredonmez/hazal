import { Module } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  providers: [InquiriesService],
  controllers: [InquiriesController],
})
export class InquiriesModule {}
