import { IsArray, IsEmail, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  /**
   * Optional: also send the same notification as an email to these addresses.
   * Useful for clients who haven't subscribed to web push but should still be reached.
   */
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emailRecipients?: string[];
}
