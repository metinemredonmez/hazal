import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Currency } from '@prisma/client';

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
  @IsOptional() @IsString() aboutTr?: string;
  @IsOptional() @IsString() aboutEn?: string;
  @IsOptional() @IsString() seoTitleTr?: string;
  @IsOptional() @IsString() seoTitleEn?: string;
  @IsOptional() @IsString() seoDescTr?: string;
  @IsOptional() @IsString() seoDescEn?: string;
}
