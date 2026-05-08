import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PushService],
  controllers: [PushController],
  exports: [PushService],
})
export class PushModule {}
