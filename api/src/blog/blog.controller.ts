import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreatePostDto {
  @IsString() @MaxLength(200) titleTr: string;
  @IsString() @MaxLength(200) titleEn: string;
  @IsOptional() @IsString() @MaxLength(500) excerptTr?: string;
  @IsOptional() @IsString() @MaxLength(500) excerptEn?: string;
  @IsOptional() @IsString() bodyTr?: string;
  @IsOptional() @IsString() bodyEn?: string;
  @IsOptional() @IsIn(['ARTICLE', 'PRESS', 'VIDEO']) kind?: 'ARTICLE' | 'PRESS' | 'VIDEO';
  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED']) status?: 'DRAFT' | 'PUBLISHED';
  @IsOptional() @IsString() coverImage?: string;
  @IsOptional() @IsString() externalUrl?: string;
}

class UpdatePostDto {
  @IsOptional() @IsString() @MaxLength(200) titleTr?: string;
  @IsOptional() @IsString() @MaxLength(200) titleEn?: string;
  @IsOptional() @IsString() @MaxLength(500) excerptTr?: string;
  @IsOptional() @IsString() @MaxLength(500) excerptEn?: string;
  @IsOptional() @IsString() bodyTr?: string;
  @IsOptional() @IsString() bodyEn?: string;
  @IsOptional() @IsIn(['ARTICLE', 'PRESS', 'VIDEO']) kind?: 'ARTICLE' | 'PRESS' | 'VIDEO';
  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED']) status?: 'DRAFT' | 'PUBLISHED';
  @IsOptional() @IsString() coverImage?: string;
  @IsOptional() @IsString() externalUrl?: string;
}

/** Public read endpoints for the web site */
@ApiTags('blog (public)')
@Controller('blog')
export class BlogPublicController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('kind') kind?: string,
  ) {
    return this.blog.listPublic(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 12,
      kind,
    );
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.blog.getPublicBySlug(slug);
  }
}

/** Admin CRUD */
@ApiTags('blog (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/blog')
export class BlogAdminController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.blog.listAdmin(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 50,
    );
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.blog.getById(id);
  }

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.blog.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.blog.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blog.remove(id);
  }
}
