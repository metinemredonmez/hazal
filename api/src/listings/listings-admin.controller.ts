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
}
