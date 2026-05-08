import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import type { Express } from 'express';
import { AiService } from './ai.service';
import {
  GenerateDescriptionDto,
  TranslateDto,
  SuggestReplyDto,
  SocialPostDto,
  WhatsappTemplateDto,
  AnalyzeInquiryDto,
  StructureBulletsDto,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get('status')
  status() {
    return this.ai.isConfigured();
  }

  @Post('generate-description')
  generate(@Body() dto: GenerateDescriptionDto) {
    return this.ai.generateDescription(dto);
  }

  @Post('translate')
  translate(@Body() dto: TranslateDto) {
    return this.ai.translate(dto);
  }

  @Post('suggest-reply')
  suggestReply(@Body() dto: SuggestReplyDto) {
    return this.ai.suggestReply(dto);
  }

  @Post('social-post')
  socialPost(@Body() dto: SocialPostDto) {
    return this.ai.socialPost(dto);
  }

  @Post('whatsapp-template')
  whatsappTemplate(@Body() dto: WhatsappTemplateDto) {
    return this.ai.whatsappTemplates(dto);
  }

  @Post('analyze-inquiry')
  analyzeInquiry(@Body() dto: AnalyzeInquiryDto) {
    return this.ai.analyzeInquiry(dto);
  }

  @Post('structure-bullets')
  structureBullets(@Body() dto: StructureBulletsDto) {
    return this.ai.structureBullets(dto);
  }

  @Post('transcribe')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audio', { limits: { fileSize: 25 * 1024 * 1024 } }))
  transcribe(@UploadedFile() file: Express.Multer.File) {
    return this.ai.transcribeVoice(file);
  }
}
