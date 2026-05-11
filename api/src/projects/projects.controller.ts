import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('projects (public)')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.listPublic();
  }

  @Get('featured')
  featured() {
    return this.projects.featured();
  }

  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.projects.getBySlug(slug);
  }
}
