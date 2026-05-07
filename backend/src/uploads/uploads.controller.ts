import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';
import { ListingsService } from '../listings/listings.service';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB ?? '10', 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(process.cwd(), UPLOAD_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuid()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
  }
  cb(null, true);
};

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/uploads')
export class UploadsController {
  constructor(
    private readonly uploads: UploadsService,
    private readonly listings: ListingsService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage,
      fileFilter,
      limits: { fileSize: MAX_MB * 1024 * 1024 },
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files uploaded');
    return files.map((f) => ({
      filename: f.filename,
      url: this.uploads.publicUrlFor(f.filename),
      size: f.size,
      mimetype: f.mimetype,
    }));
  }

  @Post('listings/:id/images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage,
      fileFilter,
      limits: { fileSize: MAX_MB * 1024 * 1024 },
    }),
  )
  async uploadForListing(
    @Param('id') listingId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) throw new BadRequestException('No files uploaded');
    const urls = files.map((f) => this.uploads.publicUrlFor(f.filename));
    return this.listings.addImages(listingId, urls);
  }
}
