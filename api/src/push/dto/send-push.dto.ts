import { IsArray, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendPushDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  titleTr!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  titleEn!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  bodyTr!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  bodyEn!: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedPlayerIds?: string[];

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
