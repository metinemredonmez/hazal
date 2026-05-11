import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectInput, ProjectsService } from './projects.service';

@ApiTags('projects (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.listAdmin();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.projects.getOne(id);
  }

  @Post()
  create(@Body() body: ProjectInput) {
    return this.projects.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: ProjectInput) {
    return this.projects.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projects.remove(id);
  }
}
