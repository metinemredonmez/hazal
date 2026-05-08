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

    // Build a compact catalog the model can search through (max 30 listings)
    const catalog = await this.prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 30,
      select: {
        slug: true,
        titleTr: true,
        titleEn: true,
        type: true,
        category: true,
        price: true,
        currency: true,
        bedrooms: true,
        bathrooms: true,
        areaM2: true,
        city: true,
        district: true,
      },
    });

    const catalogText = catalog
      .map(
        (l) =>
          `[${l.slug}] ${locale === 'tr' ? l.titleTr : l.titleEn} · ${l.type} · ${l.category} · ${
            l.bedrooms ?? '?'
          }+1 · ${l.areaM2 ?? '?'}m² · ${l.district ?? l.city ?? ''} · ${Number(l.price).toLocaleString('tr-TR')} ${l.currency}`,
      )
      .join('\n');

    const systemPrompt =
      locale === 'tr'
        ? `Sen Hazal Muti'nin sanal gayrimenkul danışmanısın. İstanbul ve Bodrum'da lüks gayrimenkul portföyünü ziyaretçilere tanıtıyorsun.

Aşağıda Hazal'ın güncel aktif portföyü var (her ilanın slug'ı [köşeli parantez] içinde):

${catalogText}

Kurallar:
- Cevapların kısa, sıcak ve profesyonel olsun. Türkçe.
- Ziyaretçinin ihtiyacını net olarak anla (bütçe, bölge, oda sayısı, kullanım amacı). Soru sor.
- Uygun ilan(lar) varsa öner. Maksimum 3 öneri.
- Öneri yaparken slug'ları her zaman [köşeli parantez] içinde belirt.
- Eğer kullanıcı ciddiyse veya iletişim istiyorsa, ona "Hazal'a doğrudan ulaşman için iletişim formunu açabilirim" de.
- Asla fiyat pazarlığı yapma, yalnızca portföydeki bilgileri ver.
- Portföyde olmayan bir ilanı uydurma.

Yanıtının sonunda STRICT JSON satırı ekle:
\`\`\`json
{"recommend": ["slug1","slug2"], "suggestInquiry": true|false}
\`\`\``
        : `You are Hazal Muti's AI real-estate concierge for luxury properties in Istanbul and Bodrum.

Active portfolio (each listing's slug in [brackets]):

${catalogText}

Rules:
- Keep replies short, warm, professional. English.
- Understand the visitor's need (budget, area, bedrooms, intent). Ask follow-ups.
- Recommend up to 3 listings. Always cite slugs in [brackets].
- If they seem serious or want contact, offer "I can open the contact form to reach Hazal directly."
- Never negotiate prices. Don't invent listings.

End your reply with a STRICT JSON line:
\`\`\`json
{"recommend": ["slug1","slug2"], "suggestInquiry": true|false}
\`\`\``;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...dto.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.6,
        max_tokens: 600,
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

    // Extract JSON tail
    let recommend: string[] = [];
    let suggestInquiry = false;
    let cleanReply = raw;
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const meta = JSON.parse(jsonMatch[1]);
        if (Array.isArray(meta.recommend)) {
          recommend = meta.recommend.filter((s: unknown): s is string => typeof s === 'string');
        }
        if (typeof meta.suggestInquiry === 'boolean') {
          suggestInquiry = meta.suggestInquiry;
        }
      } catch {
        // ignore
      }
      cleanReply = raw.replace(jsonMatch[0], '').trim();
    }

    // Validate slugs against catalog
    const validSlugs = new Set(catalog.map((l) => l.slug));
    const recommendedSlugs = recommend.filter((s) => validSlugs.has(s)).slice(0, 3);

    return { reply: cleanReply, recommendedSlugs, suggestInquiry };
  }
}
