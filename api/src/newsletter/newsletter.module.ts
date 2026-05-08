import { Module } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterPublicController, NewsletterAdminController } from './newsletter.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [NewsletterService],
  controllers: [NewsletterPublicController, NewsletterAdminController],
  exports: [NewsletterService],
})
export class NewsletterModule {}
