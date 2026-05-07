import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InquiryStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryInquiriesDto extends PaginationDto {
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  listingId?: string;
}
