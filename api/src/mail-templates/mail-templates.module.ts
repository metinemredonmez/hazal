import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MailTemplatesService } from './mail-templates.service';
import { MailTemplatesController } from './mail-templates.controller';

@Module({
  imports: [AuthModule],
  providers: [MailTemplatesService],
  controllers: [MailTemplatesController],
  exports: [MailTemplatesService],
})
export class MailTemplatesModule {}
