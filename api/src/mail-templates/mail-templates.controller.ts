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
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MailTemplateCategory } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MailTemplatesService } from './mail-templates.service';

class CreateMailTemplateDto {
  @IsString() @MinLength(1) @MaxLength(120) name!: string;
  @IsEnum(MailTemplateCategory) category!: MailTemplateCategory;
  @IsString() @MinLength(1) @MaxLength(200) subject!: string;
  @IsString() @MinLength(1) bodyHtml!: string;
  @IsOptional() @IsString() bodyText?: string;
  @IsOptional() @IsArray() variables?: Array<{
    key: string;
    label: string;
    type?: string;
    default?: string;
  }>;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

class UpdateMailTemplateDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsEnum(MailTemplateCategory) category?: MailTemplateCategory;
  @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @IsOptional() @IsString() bodyHtml?: string;
  @IsOptional() @IsString() bodyText?: string;
  @IsOptional() @IsArray() variables?: Array<{
    key: string;
    label: string;
    type?: string;
    default?: string;
  }>;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

class RenderDto {
  @IsObject() values!: Record<string, string>;
}

@ApiTags('mail-templates (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/mail-templates')
export class MailTemplatesController {
  constructor(private readonly service: MailTemplatesService) {}

  @Get()
  list(@Query('category') category?: MailTemplateCategory) {
    return this.service.list(category);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateMailTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMailTemplateDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/render')
  render(@Param('id') id: string, @Body() dto: RenderDto) {
    return this.service.render(id, dto.values ?? {});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
