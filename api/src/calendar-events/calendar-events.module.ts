import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventsController } from './calendar-events.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CalendarEventsService],
  controllers: [CalendarEventsController],
  exports: [CalendarEventsService],
})
export class CalendarEventsModule {}
