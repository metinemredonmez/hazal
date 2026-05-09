import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class GenerateDescriptionDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  bullets: string[];

  @IsString()
  @IsIn(['SALE', 'RENT'])
  type: 'SALE' | 'RENT';

  @IsString()
  @IsIn(['APARTMENT', 'VILLA', 'HOUSE', 'LAND', 'OFFICE', 'COMMERCIAL', 'OTHER'])
  category: 'APARTMENT' | 'VILLA' | 'HOUSE' | 'LAND' | 'OFFICE' | 'COMMERCIAL' | 'OTHER';

  @IsOptional() @IsNumber() @Min(0) bedrooms?: number;
  @IsOptional() @IsNumber() @Min(0) bathrooms?: number;
  @IsOptional() @IsNumber() @Min(0) areaM2?: number;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsIn(['premium', 'modern', 'family', 'investment', 'minimal']) tone?: string;
}

export class ParseSearchDto {
  @IsString()
  @MaxLength(500)
  query: string;
}

export class ConciergeMessageDto {
  @IsString()
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MaxLength(2000)
  content: string;
}

export class ConciergeChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  messages: ConciergeMessageDto[];

  @IsOptional()
  @IsIn(['tr', 'en'])
  locale?: 'tr' | 'en';
}

export class AssistantChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  messages: ConciergeMessageDto[];
}

export class TranslateDto {
  @IsString()
  @MaxLength(5000)
  text: string;

  @IsString()
  @IsIn(['tr', 'en'])
  source: 'tr' | 'en';

  @IsString()
  @IsIn(['tr', 'en'])
  target: 'tr' | 'en';
}

export class SuggestReplyDto {
  @IsString()
  inquiryId: string;

  @IsOptional()
  @IsString()
  @IsIn(['tr', 'en'])
  locale?: 'tr' | 'en';

  @IsOptional()
  @IsIn(['friendly', 'formal', 'concise'])
  tone?: 'friendly' | 'formal' | 'concise';
}

export class SocialPostDto {
  @IsString()
  listingId: string;

  @IsOptional()
  @IsString()
  @IsIn(['tr', 'en'])
  locale?: 'tr' | 'en';
}

export class WhatsappTemplateDto {
  @IsString()
  inquiryId: string;
}

export class AnalyzeInquiryDto {
  @IsString()
  inquiryId: string;
}

export class StructureBulletsDto {
  @IsString()
  @MaxLength(8000)
  raw: string;
}
