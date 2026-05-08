import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogPublicController, BlogAdminController } from './blog.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [BlogService],
  controllers: [BlogPublicController, BlogAdminController],
  exports: [BlogService],
})
export class BlogModule {}
