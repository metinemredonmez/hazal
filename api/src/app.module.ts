import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { ChatModule } from './chat/chat.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PushModule } from './push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ListingsModule,
    InquiriesModule,
    ChatModule,
    SettingsModule,
    UploadsModule,
    AiModule,
    NotificationsModule,
    AppointmentsModule,
    PushModule,
  ],
})
export class AppModule {}
