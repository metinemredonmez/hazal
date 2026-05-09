import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendPushDto } from './dto/send-push.dto';

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

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get('ONESIGNAL_APP_ID') && this.config.get('ONESIGNAL_REST_API_KEY'));
  }

  async send(dto: SendPushDto): Promise<{ id: string | null; recipients: number }> {
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
    return { id: json.id ?? null, recipients: json.recipients ?? 0 };
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
