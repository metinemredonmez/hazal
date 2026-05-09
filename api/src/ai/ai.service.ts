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
  ParseSearchDto,
  ConciergeChatDto,
  AssistantChatDto,
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

  /**
   * Parse a natural-language real-estate search query (TR or EN) into
   * structured filters that map directly onto the public /api/listings query
   * params. Used by the visitor-facing smart search bar on /ilanlar.
   */
  async parseSearch(dto: ParseSearchDto): Promise<{
    type?: 'SALE' | 'RENT';
    category?: string;
    city?: string;
    district?: string;
    minBedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    q?: string;
  }> {
    if (!this.client) {
      // Best-effort: just return the query as a generic text filter
      return { q: dto.query };
    }
    const client = this.client;

    const systemPrompt = `You convert a Turkish or English natural-language real-estate search into a JSON filter object.

Field reference:
- type: "SALE" (satılık, satış, sale, buy, alım) or "RENT" (kiralık, kira, rent, lease)
- category: APARTMENT (daire), VILLA (villa), HOUSE (müstakil ev, house), LAND (arsa, land), OFFICE (ofis, office), COMMERCIAL (dükkan, commercial), OTHER
- city: free text Turkish city name (İstanbul, Bodrum, Antalya, ...)
- district: free text Turkish district (Bebek, Etiler, Cihangir, Yalıkavak, ...)
- minBedrooms: integer (e.g., "3+1" → 3, "4+1" → 4)
- minPrice / maxPrice: numbers in Turkish Lira (TRY). Convert "5M" → 5000000, "5 milyon" → 5000000, "$2M" → 2000000 (treated as TRY for filtering simplicity).
- minArea / maxArea: square meters
- q: free text fallback for descriptive features ("deniz manzaralı", "havuzlu", "yenilenmiş", "boğaz manzaralı")

Return STRICT JSON only with the inferred fields. Omit fields not mentioned. Never invent values.

Examples:
"3+1 bebek deniz manzaralı 5M altı satılık daire" → {"type":"SALE","category":"APARTMENT","district":"Bebek","minBedrooms":3,"maxPrice":5000000,"q":"deniz manzaralı"}
"yalıkavak villa kiralık" → {"type":"RENT","category":"VILLA","district":"Yalıkavak"}
"cihangir 2+1" → {"district":"Cihangir","minBedrooms":2}
"havuzlu villa bodrum" → {"category":"VILLA","city":"Bodrum","q":"havuzlu"}
"boğaz manzaralı" → {"q":"boğaz manzaralı"}`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dto.query },
        ],
        temperature: 0.1,
      });
    } catch (err: any) {
      this.logger.warn(`parseSearch fallback (OpenAI failed): ${err?.message ?? err}`);
      return { q: dto.query };
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    } catch {
      return { q: dto.query };
    }

    const out: Record<string, unknown> = {};
    if (parsed.type === 'SALE' || parsed.type === 'RENT') out.type = parsed.type;
    const validCategories = ['APARTMENT', 'VILLA', 'HOUSE', 'LAND', 'OFFICE', 'COMMERCIAL', 'OTHER'];
    if (typeof parsed.category === 'string' && validCategories.includes(parsed.category)) {
      out.category = parsed.category;
    }
    if (typeof parsed.city === 'string' && parsed.city.length > 0) out.city = parsed.city;
    if (typeof parsed.district === 'string' && parsed.district.length > 0) out.district = parsed.district;
    for (const key of ['minBedrooms', 'minPrice', 'maxPrice', 'minArea', 'maxArea'] as const) {
      const v = parsed[key];
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) out[key] = v;
    }
    if (typeof parsed.q === 'string' && parsed.q.length > 0) out.q = parsed.q;
    return out;
  }

  /**
   * Admin AI Assistant — Hazal's internal copilot. Uses OpenAI function
   * calling so the model can pull live data from the DB (listings,
   * appointments, inquiries, stats) before answering.
   */
  async assistant(dto: AssistantChatDto): Promise<{ reply: string; usedTools: string[] }> {
    if (!this.client) {
      return {
        reply: 'AI asistan şu an kapalı. OPENAI_API_KEY env değişkenini ayarla.',
        usedTools: [],
      };
    }
    const client = this.client;

    const tools: Array<{
      type: 'function';
      function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
      };
    }> = [
      {
        type: 'function',
        function: {
          name: 'search_listings',
          description: 'Hazal\'ın ilan portföyünde arama yapar (filtreli).',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Serbest metin arama (başlık, açıklama)' },
              type: { type: 'string', enum: ['SALE', 'RENT'], description: 'Satılık veya kiralık' },
              category: {
                type: 'string',
                enum: ['APARTMENT', 'VILLA', 'HOUSE', 'LAND', 'OFFICE', 'COMMERCIAL', 'OTHER'],
              },
              district: { type: 'string', description: 'Bebek, Etiler, Cihangir vs.' },
              status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'SOLD', 'RENTED', 'PASSIVE'] },
              minBedrooms: { type: 'number' },
              maxPrice: { type: 'number', description: 'TRY cinsinden üst limit' },
              limit: { type: 'number', description: 'Maksimum sonuç (varsayılan 10)' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_appointments',
          description: 'Belirli tarih aralığındaki randevuları listeler.',
          parameters: {
            type: 'object',
            properties: {
              fromDate: { type: 'string', description: 'YYYY-MM-DD (başlangıç tarihi)' },
              toDate: { type: 'string', description: 'YYYY-MM-DD (bitiş tarihi)' },
              status: {
                type: 'string',
                enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_inquiries',
          description: 'Müşteri taleplerini listeler. Son N günü veya status filtresi.',
          parameters: {
            type: 'object',
            properties: {
              days: { type: 'number', description: 'Son kaç gün (varsayılan 30)' },
              status: { type: 'string', enum: ['NEW', 'CONTACTED', 'HOT', 'CLOSED'] },
              limit: { type: 'number' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_stats',
          description: 'Genel portföy istatistikleri: aktif ilan, satılan, talep, görüntülenme.',
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_listing_details',
          description: 'Bir ilanın detayları (slug ile).',
          parameters: {
            type: 'object',
            properties: { slug: { type: 'string' } },
            required: ['slug'],
          },
        },
      },
      // ─── WRITE TOOLS ───
      {
        type: 'function',
        function: {
          name: 'create_appointment',
          description:
            'Yeni randevu oluşturur. Tarih ISO format YYYY-MM-DDTHH:mm (örn 2026-05-15T14:00).',
          parameters: {
            type: 'object',
            properties: {
              startsAt: { type: 'string', description: 'YYYY-MM-DDTHH:mm' },
              durationMin: { type: 'number', description: 'Süre dakika (varsayılan 60)' },
              name: { type: 'string', description: 'Müşteri adı' },
              phone: { type: 'string' },
              email: { type: 'string' },
              listingSlug: { type: 'string', description: 'Hangi ilan için (opsiyonel)' },
              location: { type: 'string', description: 'Buluşma yeri' },
              notes: { type: 'string' },
            },
            required: ['startsAt', 'name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'cancel_appointment',
          description: 'Randevuyu iptal eder (status CANCELLED yapar).',
          parameters: {
            type: 'object',
            properties: { appointmentId: { type: 'string' } },
            required: ['appointmentId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'update_inquiry_status',
          description:
            'Müşteri talebinin durumunu günceller. NEW / CONTACTED / HOT / CLOSED.',
          parameters: {
            type: 'object',
            properties: {
              inquiryId: { type: 'string' },
              status: { type: 'string', enum: ['NEW', 'CONTACTED', 'HOT', 'CLOSED'] },
              notes: { type: 'string', description: 'Opsiyonel not' },
            },
            required: ['inquiryId', 'status'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'publish_listing',
          description: "İlanı yayına alır (DRAFT → ACTIVE). Slug ile.",
          parameters: {
            type: 'object',
            properties: { slug: { type: 'string' } },
            required: ['slug'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'set_featured',
          description: 'İlanı öne çıkar / öne çıkarmayı kaldır.',
          parameters: {
            type: 'object',
            properties: {
              slug: { type: 'string' },
              featured: { type: 'boolean' },
            },
            required: ['slug', 'featured'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'update_listing_price',
          description: 'İlanın fiyatını günceller.',
          parameters: {
            type: 'object',
            properties: {
              slug: { type: 'string' },
              price: { type: 'number' },
              currency: { type: 'string', enum: ['TRY', 'USD', 'EUR'] },
            },
            required: ['slug', 'price'],
          },
        },
      },
      // ─── SMART ANALYSIS TOOLS ───
      {
        type: 'function',
        function: {
          name: 'get_today_focus',
          description:
            "Bugünün gündemi: yaklaşan randevular, yeni HOT talepler, dikkat gereken ilanlar (ör. 14+ gündür DRAFT'ta).",
          parameters: { type: 'object', properties: {} },
        },
      },
      {
        type: 'function',
        function: {
          name: 'find_free_slots',
          description:
            'Belirli tarihte/aralıkta Hazal\'ın boş zaman dilimlerini bulur. Çalışma saatleri varsayılan 09:00-19:00. 1 saatlik slot\'lar.',
          parameters: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'YYYY-MM-DD' },
              durationMin: { type: 'number', description: 'Slot süresi (varsayılan 60)' },
            },
            required: ['date'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'find_matches_for_inquiry',
          description:
            "Bir müşteri talebi için en uygun ilanları AI ile eşleştirir. Talebin metnini analiz edip aktif ilanlardan en yakın olanları bulur.",
          parameters: {
            type: 'object',
            properties: {
              inquiryId: { type: 'string' },
              limit: { type: 'number', description: 'Maks öneri (varsayılan 3)' },
            },
            required: ['inquiryId'],
          },
        },
      },
    ];

    const today = new Date();
    const systemPrompt = `Sen Hazal Muti Real Estate'in özel AI asistanısın. Türkçe yanıt ver — kısa, net, profesyonel.

Bugünün tarihi: ${today.toISOString().slice(0, 10)} (${today.toLocaleDateString('tr-TR', { weekday: 'long' })})

Kim için çalışıyorsun:
- Hazal Muti — İstanbul/Bodrum lüks gayrimenkul danışmanı
- Müşterileri lüks daire/villa arayan üst gelir grubu

Yapabileceklerin (tools):
Okuma:
- search_listings, list_appointments, list_inquiries, get_stats, get_listing_details

Yazma (aksiyon — ÖNCE NIYET TEYIDI ALMADAN ÇAĞIRMA):
- create_appointment (yeni randevu)
- cancel_appointment (randevu iptal)
- update_inquiry_status (talep durumu değiştir)
- publish_listing (ilan yayınla)
- set_featured (öne çıkar/kaldır)
- update_listing_price (fiyat güncelle)

Yazma kuralları:
- Aksiyon istendiğinde önce kullanıcıdan **net teyit** al ("Onaylıyor musun?" gibi).
- Sadece "evet/onayla/yap" gibi açık onay gelirse tool'u çağır.
- Belirsizlik varsa sor: "Hangi ilan?", "Saat kaç?" vb.
- Aksiyon sonrası: "✅ Yapıldı" + sonuç özetini söyle.

Akıllı analiz (proaktif):
- get_today_focus: "Bugün ne yapayım", "neye odaklanmalıyım", "günün özeti" gibi açık uçlu sorularda direkt çağır.
- find_free_slots: Randevu eklerken veya "yarın boşum mu" gibi sorularda.
- find_matches_for_inquiry: Talep ID verilirse veya "şu müşteriye uygun ilan" istenirse.

Cevap kuralları:
- Bir konuya cevap vermek için tool çağırman gerekiyorsa **çağır**, asla uydurma.
- Sayıları bold yap. Tarihleri "9 Mayıs Cuma 14:00" formatında ver.
- Hazal'a "siz" yerine "sen" kullan (samimi).
- Listelerde max 5 madde göster, daha fazlasını "Tümünü görmek için Talepler/Randevular sayfasını aç" diye yönlendir.
- Müşteri bilgilerini koruma — örn telefon numarasını tam göster ama bağlamı abartmadan.
- Eğer kullanıcı "bana yardımcı ol", "neye odaklanmalıyım?" gibi açık uçlu soru sorarsa: bugünkü randevuları + yeni HOT talepleri + dikkat gerektiren ilanları özetle.`;

    const messages: Array<{ role: string; content: string | null; name?: string; tool_call_id?: string; tool_calls?: unknown[] }> = [
      { role: 'system', content: systemPrompt },
      ...dto.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const usedTools: string[] = [];

    // Tool-calling loop (max 4 rounds)
    for (let i = 0; i < 4; i++) {
      let completion;
      try {
        completion = await client.chat.completions.create({
          model: this.model,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: messages as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: tools as any,
          temperature: 0.4,
          max_tokens: 800,
        });
      } catch (err: any) {
        this.logger.warn(`assistant OpenAI error: ${err?.message ?? err}`);
        return {
          reply: 'Şu an sana yardımcı olamıyorum. Lütfen tekrar dene.',
          usedTools,
        };
      }

      const msg = completion.choices[0]?.message;
      if (!msg) break;

      const toolCalls = (msg as { tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> }).tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        // Final answer
        return { reply: msg.content?.trim() ?? '', usedTools };
      }

      // Append assistant message with tool calls
      messages.push({
        role: 'assistant',
        content: msg.content ?? null,
        tool_calls: toolCalls,
      });

      // Execute each tool call
      for (const call of toolCalls) {
        usedTools.push(call.function.name);
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments);
        } catch {
          // ignore
        }
        const result = await this.executeAssistantTool(call.function.name, args);
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    return { reply: 'Cevap üretemedim, tekrar dene.', usedTools };
  }

  private async executeAssistantTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    try {
      if (name === 'search_listings') {
        const where: Record<string, unknown> = {};
        if (args.type) where.type = args.type;
        if (args.category) where.category = args.category;
        if (args.status) where.status = args.status;
        if (!args.status) where.status = 'ACTIVE'; // default to active
        if (args.district) {
          where.district = { contains: args.district as string, mode: 'insensitive' };
        }
        if (typeof args.minBedrooms === 'number') {
          where.bedrooms = { gte: args.minBedrooms };
        }
        if (typeof args.maxPrice === 'number') {
          where.price = { lte: args.maxPrice };
        }
        if (args.query) {
          (where as Record<string, unknown>).OR = [
            { titleTr: { contains: args.query as string, mode: 'insensitive' } },
            { descriptionTr: { contains: args.query as string, mode: 'insensitive' } },
          ];
        }
        const limit = typeof args.limit === 'number' ? Math.min(args.limit, 25) : 10;
        const items = await this.prisma.listing.findMany({
          where,
          take: limit,
          orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
          select: {
            slug: true,
            titleTr: true,
            type: true,
            category: true,
            price: true,
            currency: true,
            bedrooms: true,
            areaM2: true,
            district: true,
            city: true,
            status: true,
            views: true,
          },
        });
        return { count: items.length, items };
      }

      if (name === 'list_appointments') {
        const where: Record<string, unknown> = {};
        if (args.fromDate || args.toDate) {
          const range: Record<string, Date> = {};
          if (args.fromDate) range.gte = new Date(args.fromDate as string);
          if (args.toDate) {
            const to = new Date(args.toDate as string);
            to.setHours(23, 59, 59, 999);
            range.lte = to;
          }
          where.startsAt = range;
        }
        if (args.status) where.status = args.status;
        const items = await this.prisma.appointment.findMany({
          where,
          orderBy: { startsAt: 'asc' },
          take: 50,
          include: { listing: { select: { titleTr: true, district: true, slug: true } } },
        });
        return { count: items.length, items };
      }

      if (name === 'list_inquiries') {
        const days = typeof args.days === 'number' ? args.days : 30;
        const where: Record<string, unknown> = {
          createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        };
        if (args.status) where.status = args.status;
        const limit = typeof args.limit === 'number' ? Math.min(args.limit, 50) : 20;
        const items = await this.prisma.inquiry.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: { listing: { select: { titleTr: true, slug: true } } },
        });
        return { count: items.length, items };
      }

      if (name === 'get_stats') {
        const [total, active, sold, rented, draft, totalInquiries, hotInquiries, upcomingAppts] =
          await Promise.all([
            this.prisma.listing.count(),
            this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
            this.prisma.listing.count({ where: { status: 'SOLD' } }),
            this.prisma.listing.count({ where: { status: 'RENTED' } }),
            this.prisma.listing.count({ where: { status: 'DRAFT' } }),
            this.prisma.inquiry.count({
              where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            }),
            this.prisma.inquiry.count({ where: { status: 'HOT' } }),
            this.prisma.appointment.count({
              where: {
                startsAt: { gte: new Date() },
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
              },
            }),
          ]);
        return {
          listings: { total, active, sold, rented, draft },
          inquiries: { last30days: totalInquiries, hot: hotInquiries },
          appointments: { upcoming: upcomingAppts },
        };
      }

      if (name === 'get_listing_details') {
        const slug = args.slug as string;
        const listing = await this.prisma.listing.findUnique({
          where: { slug },
          include: { images: { orderBy: { order: 'asc' }, take: 3 } },
        });
        return listing ?? { error: 'Listing not found' };
      }

      // ─── WRITE TOOLS ───
      if (name === 'create_appointment') {
        const startsAt = new Date(args.startsAt as string);
        if (Number.isNaN(startsAt.getTime())) {
          return { error: 'Geçersiz tarih formatı. YYYY-MM-DDTHH:mm bekleniyor.' };
        }
        let listingId: string | undefined;
        if (args.listingSlug) {
          const listing = await this.prisma.listing.findUnique({
            where: { slug: args.listingSlug as string },
            select: { id: true },
          });
          listingId = listing?.id;
        }
        const created = await this.prisma.appointment.create({
          data: {
            startsAt,
            durationMin: typeof args.durationMin === 'number' ? args.durationMin : 60,
            name: args.name as string,
            email: (args.email as string) || null,
            phone: (args.phone as string) || null,
            listingId: listingId || null,
            location: (args.location as string) || null,
            notes: (args.notes as string) || null,
            status: 'SCHEDULED',
          },
        });
        return { ok: true, appointment: created };
      }

      if (name === 'cancel_appointment') {
        const updated = await this.prisma.appointment.update({
          where: { id: args.appointmentId as string },
          data: { status: 'CANCELLED' },
        });
        return { ok: true, appointment: updated };
      }

      if (name === 'update_inquiry_status') {
        const data: Record<string, unknown> = { status: args.status };
        if (args.notes) data.notes = args.notes as string;
        const updated = await this.prisma.inquiry.update({
          where: { id: args.inquiryId as string },
          data,
        });
        return { ok: true, inquiry: updated };
      }

      if (name === 'publish_listing') {
        const updated = await this.prisma.listing.update({
          where: { slug: args.slug as string },
          data: { status: 'ACTIVE' },
        });
        return { ok: true, listing: updated };
      }

      if (name === 'set_featured') {
        const updated = await this.prisma.listing.update({
          where: { slug: args.slug as string },
          data: { featured: args.featured as boolean },
        });
        return { ok: true, listing: updated };
      }

      if (name === 'update_listing_price') {
        const data: Record<string, unknown> = { price: args.price };
        if (args.currency) data.currency = args.currency;
        const updated = await this.prisma.listing.update({
          where: { slug: args.slug as string },
          data,
        });
        return { ok: true, listing: updated };
      }

      // ─── SMART TOOLS ───
      if (name === 'get_today_focus') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const [todayAppts, hotInquiries, newInquiries, oldDrafts, upcomingTomorrow] =
          await Promise.all([
            this.prisma.appointment.findMany({
              where: {
                startsAt: { gte: startOfDay, lte: endOfDay },
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
              },
              orderBy: { startsAt: 'asc' },
              include: { listing: { select: { titleTr: true, district: true, slug: true } } },
            }),
            this.prisma.inquiry.findMany({
              where: { status: 'HOT' },
              orderBy: { createdAt: 'desc' },
              take: 5,
            }),
            this.prisma.inquiry.count({
              where: {
                status: 'NEW',
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
              },
            }),
            this.prisma.listing.findMany({
              where: { status: 'DRAFT', createdAt: { lte: fourteenDaysAgo } },
              select: { slug: true, titleTr: true, createdAt: true },
              take: 5,
            }),
            this.prisma.appointment.count({
              where: {
                startsAt: {
                  gte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
                  lte: new Date(startOfDay.getTime() + 48 * 60 * 60 * 1000),
                },
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
              },
            }),
          ]);

        return {
          today: {
            appointmentCount: todayAppts.length,
            appointments: todayAppts,
          },
          tomorrow: {
            appointmentCount: upcomingTomorrow,
          },
          hotInquiries: hotInquiries.length > 0 ? hotInquiries : null,
          newInquiriesLast24h: newInquiries,
          stuckDrafts: oldDrafts.length > 0 ? oldDrafts : null,
        };
      }

      if (name === 'find_free_slots') {
        const date = new Date(args.date as string);
        const startHour = 9;
        const endHour = 19;
        const slotMin = typeof args.durationMin === 'number' ? args.durationMin : 60;

        const dayStart = new Date(date);
        dayStart.setHours(startHour, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(endHour, 0, 0, 0);

        const busy = await this.prisma.appointment.findMany({
          where: {
            startsAt: { gte: dayStart, lt: dayEnd },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
          select: { startsAt: true, durationMin: true },
        });

        const slots: Array<{ start: string; end: string }> = [];
        for (
          let t = new Date(dayStart);
          t.getTime() + slotMin * 60_000 <= dayEnd.getTime();
          t = new Date(t.getTime() + slotMin * 60_000)
        ) {
          const slotEnd = new Date(t.getTime() + slotMin * 60_000);
          const conflicts = busy.some((a) => {
            const aEnd = new Date(a.startsAt.getTime() + a.durationMin * 60_000);
            return t < aEnd && slotEnd > a.startsAt;
          });
          if (!conflicts) {
            slots.push({
              start: t.toISOString(),
              end: slotEnd.toISOString(),
            });
          }
        }
        return {
          date: args.date,
          freeSlots: slots,
          busyAppointments: busy.length,
        };
      }

      if (name === 'find_matches_for_inquiry') {
        const inquiry = await this.prisma.inquiry.findUnique({
          where: { id: args.inquiryId as string },
          include: { listing: true },
        });
        if (!inquiry) return { error: 'Talep bulunamadı' };

        // Heuristic: extract keywords from message + use as q filter
        const text = inquiry.message.toLowerCase();
        const districts = ['bebek', 'etiler', 'cihangir', 'yalıkavak', 'bodrum', 'ulus', 'levent'];
        const matchedDistrict = districts.find((d) => text.includes(d));
        const isRent = /kiral[ıi]k|kira|rent/.test(text);
        const isSale = /sat[ıi]l[ıi]k|sat[ıi][şs]|sale/.test(text);
        const bedroomsMatch = text.match(/(\d)\s*\+\s*1/);
        const minBedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : undefined;

        const where: Record<string, unknown> = { status: 'ACTIVE' };
        if (matchedDistrict) where.district = { contains: matchedDistrict, mode: 'insensitive' };
        if (isRent && !isSale) where.type = 'RENT';
        if (isSale && !isRent) where.type = 'SALE';
        if (minBedrooms) where.bedrooms = { gte: minBedrooms };

        const limit = typeof args.limit === 'number' ? args.limit : 3;
        const matches = await this.prisma.listing.findMany({
          where,
          take: limit,
          orderBy: [{ featured: 'desc' }, { views: 'desc' }],
          select: {
            slug: true,
            titleTr: true,
            type: true,
            price: true,
            currency: true,
            bedrooms: true,
            district: true,
            areaM2: true,
          },
        });
        return {
          inquiry: { id: inquiry.id, name: inquiry.name, message: inquiry.message },
          parsed: { district: matchedDistrict, isRent, isSale, minBedrooms },
          matches,
          count: matches.length,
        };
      }

      return { error: `Unknown tool: ${name}` };
    } catch (err) {
      this.logger.warn(`Tool ${name} error: ${(err as Error).message}`);
      return { error: (err as Error).message };
    }
  }

  /**
   * AI concierge — public visitor-facing chat about Hazal's listings.
   * Pulls a small recent-listings catalog into the system prompt so the
   * model can recommend specific properties by slug.
   */
  async concierge(dto: ConciergeChatDto): Promise<{
    reply: string;
    recommendedSlugs: string[];
    suggestInquiry: boolean;
  }> {
    const locale = dto.locale ?? 'tr';

    if (!this.client) {
      const fallback =
        locale === 'tr'
          ? 'Şu an AI yardımcı kapalı. Sorularınız için iletişim formunu kullanabilir veya doğrudan arayabilirsiniz.'
          : 'AI assistant is currently offline. Please use the contact form or call directly.';
      return { reply: fallback, recommendedSlugs: [], suggestInquiry: true };
    }
    const client = this.client;

    // Build a compact catalog the model can search through (max 20 listings — daha az = daha az token = daha hizli)
    const catalog = await this.prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 20,
      select: {
        slug: true,
        titleTr: true,
        titleEn: true,
        type: true,
        category: true,
        price: true,
        currency: true,
        bedrooms: true,
        areaM2: true,
        city: true,
        district: true,
      },
    });

    const catalogText = catalog
      .map(
        (l) =>
          `[${l.slug}] ${locale === 'tr' ? l.titleTr : l.titleEn}|${l.type}|${l.category}|${
            l.bedrooms ?? '?'
          }+1|${l.areaM2 ?? '?'}m²|${l.district ?? l.city ?? ''}|${Number(l.price).toLocaleString('tr-TR')}${l.currency}`,
      )
      .join('\n');

    const systemPrompt =
      locale === 'tr'
        ? `Sen Hazal Muti'nin sanal gayrimenkul danışmanısın. İstanbul ve Bodrum lüks portföyünü ziyaretçilere tanıtıyorsun.

Aktif portföy (slug|baslik|tip|kategori|oda|m2|bolge|fiyat):
${catalogText}

Kurallar:
- Türkçe, kısa (2-3 cümle), sıcak ve profesyonel.
- Eksik bilgi varsa (bütçe/bölge/oda) tek soru sor.
- En uygun 1-3 slug öner.
- Portföyde olmayan ilanı uydurma.
- Pazarlık yapma.
- Yanıtı SADECE JSON olarak ver: {"reply":"...","recommend":["slug"],"suggestInquiry":boolean}`
        : `You are Hazal Muti's AI real-estate concierge for luxury Istanbul/Bodrum properties.

Active portfolio (slug|title|type|category|beds|m2|area|price):
${catalogText}

Rules:
- English, short (2-3 sentences), warm, professional.
- If budget/area/beds missing, ask one focused question.
- Recommend 1-3 best slugs.
- Don't invent listings. No price negotiation.
- Reply ONLY JSON: {"reply":"...","recommend":["slug"],"suggestInquiry":boolean}`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...dto.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.5,
        max_tokens: 350,
        response_format: { type: 'json_object' },
      });
    } catch (err: any) {
      this.logger.warn(`concierge OpenAI error: ${err?.message ?? err}`);
      return {
        reply:
          locale === 'tr'
            ? 'Şu anda yardımcı olamıyorum. Lütfen iletişim formunu kullanın veya tekrar deneyin.'
            : 'I cannot help right now. Please use the contact form or try again.',
        recommendedSlugs: [],
        suggestInquiry: true,
      };
    }

    const raw = completion.choices[0]?.message?.content?.trim() ?? '';

    let recommend: string[] = [];
    let suggestInquiry = false;
    let cleanReply = raw;
    try {
      const meta = JSON.parse(raw);
      if (typeof meta.reply === 'string') cleanReply = meta.reply;
      if (Array.isArray(meta.recommend)) {
        recommend = meta.recommend.filter((s: unknown): s is string => typeof s === 'string');
      }
      if (typeof meta.suggestInquiry === 'boolean') {
        suggestInquiry = meta.suggestInquiry;
      }
    } catch {
      // raw model output without JSON wrap — still ship as reply
    }

    const validSlugs = new Set(catalog.map((l) => l.slug));
    const recommendedSlugs = recommend.filter((s) => validSlugs.has(s)).slice(0, 3);

    return { reply: cleanReply, recommendedSlugs, suggestInquiry };
  }
}
