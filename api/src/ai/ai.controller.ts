import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateDescriptionDto, TranslateDto, SuggestReplyDto } from './dto/ai.dto';
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
}
