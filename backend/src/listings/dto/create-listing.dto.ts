import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ListingCategory, ListingStatus, ListingType, Currency } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @MaxLength(200)
  titleTr: string;

  @IsString()
  @MaxLength(200)
  titleEn: string;

  @IsString()
  descriptionTr: string;

  @IsString()
  descriptionEn: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(ListingType)
  type: ListingType;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  areaM2?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsInt()
  yearBuilt?: number;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  tourUrl?: string;

  @IsOptional()
  @IsString()
  metaTitleTr?: string;

  @IsOptional()
  @IsString()
  metaTitleEn?: string;

  @IsOptional()
  @IsString()
  metaDescTr?: string;

  @IsOptional()
  @IsString()
  metaDescEn?: string;
}
