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
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto, ReorderImagesDto } from './dto/query-listings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('listings (admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/listings')
export class ListingsAdminController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  list(@Query() query: QueryListingsDto) {
    return this.listings.list(query, { publicOnly: false });
  }

  @Get('stats')
  stats() {
    return this.listings.stats();
  }

  @Get('stats/timeseries')
  timeseries(@Query('days') days?: string) {
    return this.listings.timeseries(days ? parseInt(days, 10) : 30);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.listings.getById(id);
  }

  @Post()
  create(@Body() dto: CreateListingDto) {
    return this.listings.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listings.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listings.remove(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.listings.duplicate(id);
  }

  @Get('bulk/template')
  bulkTemplate() {
    return {
      filename: 'listings-template.csv',
      contentType: 'text/csv; charset=utf-8',
      content: this.listings.bulkImportTemplate(),
      headers: ListingsService.BULK_TEMPLATE_HEADERS,
    };
  }

  @Post('bulk/import')
  bulkImport(@Body() body: { csv: string }) {
    return this.listings.bulkImport(body?.csv ?? '');
  }

  @Post('bulk/update')
  bulkUpdate(@Body() body: { ids: string[]; status?: string; featured?: boolean }) {
    return this.listings.bulkUpdate(body.ids, {
      status: body.status,
      featured: body.featured,
    });
  }

  @Post('bulk/delete')
  bulkDelete(@Body() body: { ids: string[] }) {
    return this.listings.bulkDelete(body.ids);
  }

  @Post(':id/images')
  addImages(@Param('id') id: string, @Body('urls') urls: string[]) {
    return this.listings.addImages(id, urls);
  }

  @Delete(':id/images/:imageId')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.listings.removeImage(id, imageId);
  }

  @Patch(':id/images/reorder')
  reorderImages(@Param('id') id: string, @Body() dto: ReorderImagesDto) {
    return this.listings.reorderImages(id, dto.imageIds);
  }

  @Patch(':id/images/:imageId/primary')
  setPrimary(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.listings.setPrimaryImage(id, imageId);
  }
}
