import { Injectable, ServiceUnavailableException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import {
  GenerateDescriptionDto,
  TranslateDto,
  SuggestReplyDto,
  SocialPostDto,
  WhatsappTemplateDto,
  AnalyzeInquiryDto,
  StructureBulletsDto,
} from './dto/ai.dto';
import { Readable } from 'stream';
import type { Express } from 'express';

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

  async socialPost(dto: SocialPostDto) {
    const client = this.requireClient();
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { images: { take: 1 } },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const locale = dto.locale ?? 'tr';
    const title = locale === 'tr' ? listing.titleTr : listing.titleEn;
    const desc = locale === 'tr' ? listing.descriptionTr : listing.descriptionEn;

    const meta = [
      listing.bedrooms != null ? `${listing.bedrooms}+1` : null,
      listing.bathrooms != null ? `${listing.bathrooms} banyo` : null,
      listing.areaM2 != null ? `${listing.areaM2} m²` : null,
      listing.district,
      listing.city,
      listing.type === 'SALE' ? (locale === 'tr' ? 'Satılık' : 'For Sale') : (locale === 'tr' ? 'Kiralık' : 'For Rent'),
    ].filter(Boolean).join(' · ');

    const prompt = `
Property: ${title}
Type: ${listing.type === 'SALE' ? 'Sale' : 'Rent'}
Details: ${meta}
Description excerpt: ${(desc ?? '').slice(0, 400)}

Write 3 social media posts in ${locale === 'tr' ? 'Turkish' : 'English'} for a luxury single-broker real estate brand.
Tone: aspirational, tasteful, no clickbait, no excessive emoji.
Return STRICT JSON (no markdown):
{
  "instagram": "(caption with 3-5 relevant hashtags inline at end, max 220 chars before hashtags, 1-2 tasteful emojis ok)",
  "linkedin": "(professional 3-4 sentences, no emoji, position as a curated listing announcement)",
  "whatsapp": "(short share message 2-3 lines for forwarding to clients, with property url placeholder {url})"
}`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You write premium social copy for a single-broker luxury real estate brand (Hazal Muti). Tone: refined, factual, never gimmicky.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
      });
    } catch (err: any) {
      this.logger.error(`OpenAI socialPost failed: ${err?.message ?? err}`);
      throw new ServiceUnavailableException(`OpenAI request failed: ${err?.message ?? 'unknown'}`);
    }

    try {
      return JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    } catch {
      throw new ServiceUnavailableException('AI returned invalid JSON');
    }
  }

  async whatsappTemplates(dto: WhatsappTemplateDto) {
    const client = this.requireClient();
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id: dto.inquiryId },
      include: { listing: { select: { titleTr: true, titleEn: true, slug: true, district: true, city: true } } },
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');

    const propRef = inquiry.listing
      ? `the property "${inquiry.listing.titleTr}" in ${[inquiry.listing.district, inquiry.listing.city].filter(Boolean).join(', ')}`
      : 'a property they inquired about';

    const prompt = `
Customer: ${inquiry.name}${inquiry.phone ? ' (' + inquiry.phone + ')' : ''}
Their message: "${inquiry.message}"
Context: They inquired about ${propRef}.

Draft 3 short WhatsApp message templates Hazal can send.
Each must:
- be in Turkish
- be 2-4 sentences max
- feel personal but professional
- offer to schedule a viewing or call

Return STRICT JSON (no markdown):
{
  "friendly": "...",
  "professional": "...",
  "short": "..."
}`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You draft WhatsApp messages for a luxury real estate broker (Hazal Muti). Always Turkish, always 2-4 sentences, never include emojis unless very subtle.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
      });
    } catch (err: any) {
      this.logger.error(`OpenAI whatsappTemplates failed: ${err?.message ?? err}`);
      throw new ServiceUnavailableException(`OpenAI request failed: ${err?.message ?? 'unknown'}`);
    }

    try {
      return JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    } catch {
      throw new ServiceUnavailableException('AI returned invalid JSON');
    }
  }

  async analyzeInquiry(dto: AnalyzeInquiryDto) {
    const client = this.requireClient();
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id: dto.inquiryId },
      include: { listing: { select: { titleTr: true, price: true, currency: true } } },
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');

    const prompt = `
Inquiry message (Turkish or English):
"""${inquiry.message}"""
${inquiry.listing ? `Listed property: ${inquiry.listing.titleTr} (${inquiry.listing.price} ${inquiry.listing.currency})` : ''}
Phone provided: ${inquiry.phone ? 'yes' : 'no'}

Analyze this real-estate inquiry. Return STRICT JSON (no markdown):
{
  "score": <number 0-100, intent/heat score>,
  "intent": "browsing" | "comparing" | "ready" | "negotiating",
  "urgency": "low" | "medium" | "high",
  "budgetSignal": "<short Turkish phrase summarizing budget hint, or 'belirsiz'>",
  "summary": "<2 sentence Turkish summary of who this person is and what they want>",
  "nextAction": "<one sentence Turkish recommendation for Hazal>"
}

Scoring guide:
- "Acil görmek istiyorum / fiyat pazarlığı / hazırım" → 80-100
- "Detay verir misiniz / fiyat / metrekare" → 50-80
- "Bilgi alabilir miyim / hayalimdeki" → 20-50
- Vague / spam → 0-20`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a real-estate CRM analyst. You score buyer intent based on inquiry text. Be pragmatic and honest — score low when message is vague.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      });
    } catch (err: any) {
      this.logger.error(`OpenAI analyzeInquiry failed: ${err?.message ?? err}`);
      throw new ServiceUnavailableException(`OpenAI request failed: ${err?.message ?? 'unknown'}`);
    }

    try {
      return JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    } catch {
      throw new ServiceUnavailableException('AI returned invalid JSON');
    }
  }

  async transcribeVoice(file: Express.Multer.File): Promise<{ text: string }> {
    const client = this.requireClient();
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new ServiceUnavailableException('Empty audio file');
    }
    try {
      // OpenAI SDK accepts a File-like via toFile() helper
      const { toFile } = await import('openai');
      const audio = await toFile(Readable.from(file.buffer), file.originalname || 'audio.webm', {
        type: file.mimetype || 'audio/webm',
      });
      const res = await client.audio.transcriptions.create({
        file: audio,
        model: 'whisper-1',
      });
      return { text: res.text };
    } catch (err: any) {
      this.logger.error(`OpenAI transcribe failed: ${err?.message ?? err}`);
      throw new ServiceUnavailableException(`Transcription failed: ${err?.message ?? 'unknown'}`);
    }
  }

  async structureBullets(dto: StructureBulletsDto) {
    const client = this.requireClient();
    const prompt = `
Raw notes (could be Turkish or English):
"""${dto.raw}"""

Extract clean, factual bullet points for a luxury real-estate listing description input.
Return STRICT JSON (no markdown):
{
  "bullets": ["...", "...", "..."]
}
Each bullet 3-12 words. Include only facts present in the notes (no invention).
Return at most 12 bullets, in Turkish.`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You convert messy real-estate notes into clean Turkish bullet points.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      });
    } catch (err: any) {
      this.logger.error(`OpenAI structureBullets failed: ${err?.message ?? err}`);
      throw new ServiceUnavailableException(`OpenAI request failed: ${err?.message ?? 'unknown'}`);
    }

    try {
      return JSON.parse(completion.choices[0]?.message?.content ?? '{"bullets":[]}');
    } catch {
      throw new ServiceUnavailableException('AI returned invalid JSON');
    }
  }

  isConfigured() {
    return { enabled: !!this.client, model: this.client ? this.model : null };
  }
}
