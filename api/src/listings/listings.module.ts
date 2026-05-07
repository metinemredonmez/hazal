import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ListingsAdminController } from './listings-admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ListingsService],
  controllers: [ListingsController, ListingsAdminController],
  exports: [ListingsService],
})
export class ListingsModule {}
