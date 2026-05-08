import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ListingsAdminController } from './listings-admin.controller';
import { AuthModule } from '../auth/auth.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [AuthModule, PushModule],
  providers: [ListingsService],
  controllers: [ListingsController, ListingsAdminController],
  exports: [ListingsService],
})
export class ListingsModule {}
