import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from './email.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [NotificationsService, NotificationsGateway, EmailService],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationsGateway, EmailService],
})
export class NotificationsModule {}
