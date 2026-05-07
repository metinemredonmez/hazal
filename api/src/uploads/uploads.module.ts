import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { AuthModule } from '../auth/auth.module';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [AuthModule, ListingsModule],
  providers: [UploadsService],
  controllers: [UploadsController],
})
export class UploadsModule {}
