import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ParseSearchDto, ConciergeChatDto } from './dto/ai.dto';

/**
 * Public AI endpoints — no auth, used by visitor-facing web site.
 * Smart search (NL → filter) and concierge chat.
 */
@ApiTags('ai (public)')
@Controller('ai')
export class AiPublicController {
  constructor(private readonly ai: AiService) {}

  @Post('parse-search')
  parseSearch(@Body() dto: ParseSearchDto) {
    return this.ai.parseSearch(dto);
  }

  @Post('concierge')
  concierge(@Body() dto: ConciergeChatDto) {
    return this.ai.concierge(dto);
  }
}
