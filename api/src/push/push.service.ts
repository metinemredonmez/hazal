import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendPushDto } from './dto/send-push.dto';
import { EmailService } from '../notifications/email.service';

interface OneSignalCreateResponse {
  id?: string;
  recipients?: number;
  external_id?: string;
  errors?: unknown;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly endpoint = 'https://api.onesignal.com/notifications';

  constructor(
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.config.get('ONESIGNAL_APP_ID') && this.config.get('ONESIGNAL_REST_API_KEY'));
  }

  async send(
    dto: SendPushDto,
  ): Promise<{ id: string | null; recipients: number; emailsSent: number; emailsFailed: number }> {
    const appId = this.config.get<string>('ONESIGNAL_APP_ID');
    const apiKey = this.config.get<string>('ONESIGNAL_REST_API_KEY');
    if (!appId || !apiKey) {
      throw new ServiceUnavailableException(
        'OneSignal not configured. Set ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY in env.',
      );
    }

    const payload: Record<string, unknown> = {
      app_id: appId,
      headings: { tr: dto.titleTr, en: dto.titleEn },
      contents: { tr: dto.bodyTr, en: dto.bodyEn },
    };

    if (dto.url) payload.url = dto.url;
    if (dto.imageUrl) {
      payload.chrome_web_image = dto.imageUrl;
      payload.big_picture = dto.imageUrl;
    }
    if (dto.data) payload.data = dto.data;

    if (dto.includedPlayerIds && dto.includedPlayerIds.length > 0) {
      payload.include_player_ids = dto.includedPlayerIds;
    } else if (dto.segments && dto.segments.length > 0) {
      payload.included_segments = dto.segments;
    } else {
      payload.included_segments = ['Subscribed Users'];
    }

    let res: Response;
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      this.logger.error('OneSignal request failed', err as Error);
      throw new ServiceUnavailableException('OneSignal request failed');
    }

    const json = (await res.json().catch(() => ({}))) as OneSignalCreateResponse;
    if (!res.ok) {
      this.logger.warn(`OneSignal error ${res.status}: ${JSON.stringify(json)}`);
      throw new ServiceUnavailableException(
        `OneSignal error: ${JSON.stringify(json.errors ?? json)}`,
      );
    }

    let emailsSent = 0;
    let emailsFailed = 0;
    const recipients = (dto.emailRecipients ?? []).filter(Boolean);
    if (recipients.length > 0) {
      const html = this.buildEmailHtml(dto);
      await Promise.all(
        recipients.map(async (to) => {
          try {
            await this.email.send({
              to,
              subject: dto.titleTr,
              text: dto.bodyTr + (dto.url ? `\n\n${dto.url}` : ''),
              html,
            });
            emailsSent++;
          } catch (err) {
            emailsFailed++;
            this.logger.warn(`Email to ${to} failed: ${(err as Error).message}`);
          }
        }),
      );
    }

    return {
      id: json.id ?? null,
      recipients: json.recipients ?? 0,
      emailsSent,
      emailsFailed,
    };
  }

  private buildEmailHtml(dto: SendPushDto): string {
    const safeTitle = this.escapeHtml(dto.titleTr);
    const safeBody = this.escapeHtml(dto.bodyTr).replace(/\n/g, '<br/>');
    const image = dto.imageUrl
      ? `<img src="${this.escapeAttr(dto.imageUrl)}" alt="" style="width:100%;max-width:560px;border-radius:8px;display:block;margin:0 auto 20px;" />`
      : '';
    const cta = dto.url
      ? `<p style="text-align:center;margin:24px 0 0;"><a href="${this.escapeAttr(dto.url)}" style="display:inline-block;background:#14141A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;letter-spacing:0.05em;">Detayları Gör</a></p>`
      : '';
    return `<!doctype html><html><body style="margin:0;padding:24px;background:#FAF8F4;font-family:Inter,system-ui,-apple-system,sans-serif;color:#14141A;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #E5E2DD;padding:32px 28px;border-radius:8px;">
    <p style="font-size:10px;letter-spacing:0.4em;color:#C9A96E;text-transform:uppercase;margin:0 0 12px;">Hazal Muti Real Estate</p>
    <h1 style="font-size:22px;font-weight:500;margin:0 0 16px;line-height:1.3;">${safeTitle}</h1>
    ${image}
    <p style="font-size:15px;line-height:1.6;color:#3a3a40;margin:0;">${safeBody}</p>
    ${cta}
    <hr style="border:none;border-top:1px solid #E5E2DD;margin:32px 0 16px;" />
    <p style="font-size:11px;color:#888;margin:0;">Bu e-posta size Hazal Muti Real Estate tarafından gönderilmiştir.</p>
  </div>
</body></html>`;
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private escapeAttr(s: string): string {
    return this.escapeHtml(s).replace(/'/g, '&#39;');
  }

  /** Get current OneSignal app config (web settings, etc.) */
  async getAppConfig(): Promise<Record<string, unknown>> {
    const appId = this.config.get<string>('ONESIGNAL_APP_ID');
    const apiKey = this.config.get<string>('ONESIGNAL_REST_API_KEY');
    if (!appId || !apiKey) {
      throw new ServiceUnavailableException('OneSignal not configured');
    }
    const res = await fetch(`https://api.onesignal.com/apps/${appId}`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new ServiceUnavailableException(`OneSignal config fetch failed: ${txt}`);
    }
    return res.json();
  }

  /** Update OneSignal app config (web settings, etc.) */
  async updateAppConfig(updates: {
    name?: string;
    site_name?: string;
    chrome_web_origin?: string;
    chrome_web_default_notification_icon?: string;
    chrome_web_sub_domain?: string;
    additional_data_is_root_payload?: boolean;
  }): Promise<Record<string, unknown>> {
    const appId = this.config.get<string>('ONESIGNAL_APP_ID');
    const apiKey = this.config.get<string>('ONESIGNAL_REST_API_KEY');
    if (!appId || !apiKey) {
      throw new ServiceUnavailableException('OneSignal not configured');
    }
    const res = await fetch(`https://api.onesignal.com/apps/${appId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new ServiceUnavailableException(`OneSignal config update failed: ${txt}`);
    }
    return res.json();
  }
}
