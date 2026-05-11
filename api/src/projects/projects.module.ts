import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectsAdminController } from './projects-admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ProjectsService],
  controllers: [ProjectsController, ProjectsAdminController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
