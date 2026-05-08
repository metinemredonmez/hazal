import { Injectable, ServiceUnavailableException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateDescriptionDto, TranslateDto, SuggestReplyDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: OpenAI | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (key && key.length > 10) {
      this.client = new OpenAI({ apiKey: key, timeout: 60_000, maxRetries: 1 });
    } else {
      this.logger.warn('OPENAI_API_KEY not set — AI endpoints will return 503');
    }
  }

  private get model(): string {
    return this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  private requireClient(): OpenAI {
    if (!this.client) {
      throw new ServiceUnavailableException('AI service not configured. Set OPENAI_API_KEY.');
    }
    return this.client;
  }

  async generateDescription(dto: GenerateDescriptionDto) {
    const client = this.requireClient();

    const features = [
      dto.bedrooms != null ? `${dto.bedrooms} bedrooms` : null,
      dto.bathrooms != null ? `${dto.bathrooms} bathrooms` : null,
      dto.areaM2 != null ? `${dto.areaM2} m²` : null,
      dto.city ? `City: ${dto.city}` : null,
      dto.district ? `District: ${dto.district}` : null,
    ].filter(Boolean).join(', ');

    const tone = dto.tone ?? 'premium';
    const userPrompt = `
Property: ${dto.title}
Type: ${dto.type === 'SALE' ? 'For sale' : 'For rent'}
Category: ${dto.category}
${features ? `Features: ${features}` : ''}
Bullet points:
${dto.bullets.map((b) => `- ${b}`).join('\n')}

Write a high-end real estate listing description in BOTH Turkish (TR) and English (EN).
Tone: ${tone} (premium, evocative, but factual — no hype).
Length: ~120 words per language.
Return STRICT JSON in this shape (no markdown, no extra keys):
{"titleTr":"...", "titleEn":"...", "descriptionTr":"...", "descriptionEn":"..."}`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a luxury real estate copywriter for a single-broker boutique agency. You write tasteful, accurate copy in Turkish and English.',
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });
    } catch (err: any) {
      this.logger.error(`OpenAI generateDescription failed: ${err?.message ?? err}`);
      const status = err?.status ?? err?.response?.status;
      if (status === 401) throw new ServiceUnavailableException('OpenAI API key invalid');
      if (status === 429) throw new ServiceUnavailableException('OpenAI quota exceeded or rate limited');
      throw new ServiceUnavailableException(`OpenAI request failed: ${err?.message ?? 'unknown'}`);
    }

    const raw = completion.choices[0]?.message?.content ?? '{}';
    try {
      return JSON.parse(raw);
    } catch {
      throw new ServiceUnavailableException('AI returned invalid JSON');
    }
  }

  async translate(dto: TranslateDto) {
    if (dto.source === dto.target) return { text: dto.text };
    const client = this.requireClient();

    const completion = await client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'You translate real estate listing copy. Preserve tone, formatting, and any brand names. Return ONLY the translated text, no commentary.',
        },
        {
          role: 'user',
          content: `Translate from ${dto.source.toUpperCase()} to ${dto.target.toUpperCase()}:\n\n${dto.text}`,
        },
      ],
      temperature: 0.3,
    });

    return { text: completion.choices[0]?.message?.content?.trim() ?? '' };
  }

  async suggestReply(dto: SuggestReplyDto) {
    const client = this.requireClient();

    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id: dto.inquiryId },
      include: { listing: { select: { titleTr: true, titleEn: true, slug: true } } },
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');

    const locale = dto.locale ?? 'tr';
    const tone = dto.tone ?? 'friendly';

    const completion = await client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are Hazal Muti, a luxury real estate broker. Write a ${tone}, professional reply in ${locale === 'tr' ? 'Turkish' : 'English'}. Be brief (3-5 sentences). Acknowledge their interest, offer to schedule a viewing, and provide your availability.`,
        },
        {
          role: 'user',
          content: `Customer (${inquiry.name} <${inquiry.email}>${inquiry.phone ? ' / ' + inquiry.phone : ''}) asked about ${
            inquiry.listing
              ? `the property "${locale === 'tr' ? inquiry.listing.titleTr : inquiry.listing.titleEn}"`
              : 'a property'
          }:\n\n"${inquiry.message}"\n\nDraft a reply.`,
        },
      ],
      temperature: 0.6,
    });

    return { reply: completion.choices[0]?.message?.content?.trim() ?? '' };
  }

  isConfigured() {
    return { enabled: !!this.client, model: this.client ? this.model : null };
  }
}
