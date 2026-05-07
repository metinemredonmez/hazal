import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { QueryListingsDto } from './dto/query-listings.dto';

@ApiTags('listings (public)')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}

  @Get()
  list(@Query() query: QueryListingsDto) {
    return this.listings.list(query, { publicOnly: true });
  }

  @Get('featured')
  featured() {
    return this.listings.featured();
  }

  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.listings.getBySlugPublic(slug);
  }
}
