import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { QueryInquiriesDto } from './dto/query-inquiries.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inquiries')
@Controller()
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post('inquiries')
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiries.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/inquiries')
  list(@Query() query: QueryInquiriesDto) {
    return this.inquiries.list(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/inquiries/:id')
  getOne(@Param('id') id: string) {
    return this.inquiries.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('admin/inquiries/:id')
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiries.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin/inquiries/:id')
  remove(@Param('id') id: string) {
    return this.inquiries.remove(id);
  }
}
