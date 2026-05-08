import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ParseSearchDto } from './dto/ai.dto';

/**
 * Public AI endpoints — no auth, used by visitor-facing web site.
 * Currently exposes the smart search NL → filter parser.
 */
@ApiTags('ai (public)')
@Controller('ai')
export class AiPublicController {
  constructor(private readonly ai: AiService) {}

  @Post('parse-search')
  parseSearch(@Body() dto: ParseSearchDto) {
    return this.ai.parseSearch(dto);
  }
}
