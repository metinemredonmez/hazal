import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { Currency } from '@prisma/client';
import type { PageContent } from '../page-content.types';

export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(120) brandName?: string;
  @IsOptional() @IsString() @MaxLength(200) tagline?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() @MaxLength(20) primaryColor?: string;
  @IsOptional() @IsString() @MaxLength(20) accentColor?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() @MaxLength(40) whatsapp?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() youtube?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsEnum(Currency) defaultCurrency?: Currency;
  @IsOptional() @IsString() defaultLocale?: string;
  @IsOptional() @IsString() mapboxToken?: string;
  @IsOptional() @IsString() gaId?: string;
  @IsOptional() @IsString() heroTitleTr?: string;
  @IsOptional() @IsString() heroTitleEn?: string;
  @IsOptional() @IsString() heroSubtitleTr?: string;
  @IsOptional() @IsString() heroSubtitleEn?: string;
  @IsOptional() @IsString() heroMediaUrl?: string;
  @IsOptional() @IsString() signatureUrl?: string;
  @IsOptional() @IsString() aboutTr?: string;
  @IsOptional() @IsString() aboutEn?: string;
  @IsOptional() @IsString() seoTitleTr?: string;
  @IsOptional() @IsString() seoTitleEn?: string;
  @IsOptional() @IsString() seoDescTr?: string;
  @IsOptional() @IsString() seoDescEn?: string;
  // Free-form page content (homepage sections, about page, contact page).
  // Validated only as a generic object — shape is enforced via the typed
  // PageContent interface on both frontend and backend.
  @IsOptional() @IsObject() pageContent?: PageContent;
  @IsOptional() @IsObject() emailTemplates?: Record<string, unknown>;
}
