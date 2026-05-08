import { Module } from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { ImapFetcherService } from './imap-fetcher.service';
import { MailController } from './mail.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  providers: [MailboxService, ImapFetcherService],
  controllers: [MailController],
})
export class MailModule {}
