import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Express } from 'express';
import { DocumentCategory } from '@prisma/client';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const DOCS_DIR = process.env.DOCUMENTS_DIR ?? './documents';
const MAX_MB = parseInt(process.env.MAX_DOCUMENT_SIZE_MB ?? '20', 10);

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(process.cwd(), DOCS_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    cb(null, `${randomUUID()}-${safeName}`);
  },
});

const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const fileFilter = (
  _req: unknown,
  file: { mimetype: string; originalname: string },
  cb: (err: Error | null, accept: boolean) => void,
) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
  else cb(new BadRequestException(`Desteklenmeyen format: ${file.mimetype}`), false);
};

class CreateDocumentDto {
  @IsString() @MaxLength(200) title: string;
  @IsEnum(DocumentCategory) category: DocumentCategory;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() listingId?: string;
  @IsOptional() @IsString() inquiryId?: string;
  @IsOptional() @IsString() appointmentId?: string;
  @IsOptional() @IsString() @MaxLength(200) customerName?: string;
  @IsOptional() @IsArray() tags?: string[];
}

class UpdateDocumentDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsEnum(DocumentCategory) category?: DocumentCategory;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() listingId?: string;
  @IsOptional() @IsString() inquiryId?: string;
  @IsOptional() @IsString() appointmentId?: string;
  @IsOptional() @IsString() @MaxLength(200) customerName?: string;
  @IsOptional() @IsArray() tags?: string[];
}

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('listingId') listingId?: string,
    @Query('inquiryId') inquiryId?: string,
  ) {
    return this.documents.list({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 30,
      category: category as DocumentCategory,
      search,
      listingId,
      inquiryId,
    });
  }

  @Get('stats')
  stats() {
    return this.documents.stats();
  }

  @Get('templates')
  listTemplates() {
    return this.documents.listTemplates();
  }

  @Get('templates/:id')
  getTemplate(@Param('id') id: string) {
    return this.documents.findTemplate(id);
  }

  @Post('templates/:id/render')
  async renderTemplate(
    @Param('id') id: string,
    @Body() body: { values: Record<string, string> },
  ) {
    const html = await this.documents.renderTemplate(id, body.values ?? {});
    return { html };
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.documents.findById(id);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: MAX_MB * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
  ) {
    if (!file) throw new BadRequestException('Dosya yüklenmedi');
    const tags = typeof dto.tags === 'string' ? (dto.tags as string).split(',').map((t) => t.trim()) : dto.tags;
    return this.documents.create({
      title: dto.title,
      category: dto.category,
      fileUrl: `/documents/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      description: dto.description,
      listingId: dto.listingId,
      inquiryId: dto.inquiryId,
      appointmentId: dto.appointmentId,
      customerName: dto.customerName,
      tags,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documents.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documents.remove(id);
  }
}
