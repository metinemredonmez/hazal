import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImapFlow, type FetchMessageObject } from 'imapflow';
import { simpleParser } from 'mailparser';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Fetches new messages from the configured IMAP inbox and stores them
 * in the EmailMessage table. Idempotent via (folder, imapUid) unique
 * constraint.
 *
 * Designed to be called manually (admin "Yenile" button) or from a cron.
 * No background polling — keeps the API process simple.
 */
@Injectable()
export class ImapFetcherService {
  private readonly logger = new Logger(ImapFetcherService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get('IMAP_HOST') && this.config.get('IMAP_USER') && this.config.get('IMAP_PASS'),
    );
  }

  async fetchInbox(opts: { sinceDays?: number } = {}): Promise<{ fetched: number; added: number }> {
    if (!this.isConfigured()) {
      throw new Error('IMAP not configured. Set IMAP_HOST/PORT/USER/PASS in env.');
    }
    const host = this.config.get<string>('IMAP_HOST')!;
    const port = parseInt(this.config.get<string>('IMAP_PORT') ?? '993', 10);
    const user = this.config.get<string>('IMAP_USER')!;
    const pass = this.config.get<string>('IMAP_PASS')!;
    const secure = this.config.get<string>('IMAP_SECURE') !== 'false';
    const folder = 'INBOX';

    const rejectUnauthorized =
      this.config.get<string>('IMAP_TLS_REJECT_UNAUTHORIZED') !== 'false';
    const client = new ImapFlow({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: false,
      tls: { rejectUnauthorized },
    });

    let fetched = 0;
    let added = 0;

    try {
      await client.connect();
      const lock = await client.getMailboxLock(folder);
      try {
        // Fetch messages from the last N days (default 30)
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - (opts.sinceDays ?? 30));

        const seq = await client.search({ since: sinceDate });
        if (!seq || seq.length === 0) {
          return { fetched: 0, added: 0 };
        }

        for await (const msg of client.fetch(seq, {
          envelope: true,
          source: true,
          uid: true,
          flags: true,
        })) {
          fetched += 1;
          const created = await this.persistMessage(folder, msg);
          if (created) added += 1;
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      this.logger.error(`IMAP fetch failed: ${(err as Error).message}`);
      throw err;
    } finally {
      try {
        await client.logout();
      } catch {
        // ignore
      }
    }

    this.logger.log(`IMAP fetch complete · ${fetched} scanned · ${added} new`);
    return { fetched, added };
  }

  private async persistMessage(folder: string, msg: FetchMessageObject): Promise<boolean> {
    const uid = String(msg.uid);
    // Skip if already stored
    const existing = await this.prisma.emailMessage.findUnique({
      where: { imapFolder_imapUid: { imapFolder: folder, imapUid: uid } },
    });
    if (existing) return false;

    let parsed;
    try {
      parsed = await simpleParser(msg.source as Buffer);
    } catch (err) {
      this.logger.warn(`mailparser failed for uid=${uid}: ${(err as Error).message}`);
      return false;
    }

    const fromAddr = parsed.from?.value?.[0]?.address ?? '';
    const fromName = parsed.from?.value?.[0]?.name ?? null;
    const toList = Array.isArray(parsed.to)
      ? parsed.to
      : parsed.to
        ? [parsed.to]
        : [];
    const toAddresses = toList
      .flatMap((a) => a.value ?? [])
      .map((a) => a.address)
      .filter(Boolean)
      .join(', ');
    const ccList = Array.isArray(parsed.cc) ? parsed.cc : parsed.cc ? [parsed.cc] : [];
    const ccAddresses =
      ccList
        .flatMap((a) => a.value ?? [])
        .map((a) => a.address)
        .filter(Boolean)
        .join(', ') || null;

    const subject = parsed.subject ?? '';
    const threadKey = subject
      .replace(/^(re:|fwd:|fw:)\s*/i, '')
      .trim()
      .toLowerCase()
      .slice(0, 200);

    const isRead =
      Array.isArray(msg.flags) && msg.flags.includes('\\Seen');

    await this.prisma.emailMessage.create({
      data: {
        direction: 'INBOUND',
        status: isRead ? 'READ' : 'UNREAD',
        imapUid: uid,
        imapFolder: folder,
        messageId: parsed.messageId ?? null,
        inReplyTo: parsed.inReplyTo ?? null,
        threadKey,
        fromAddress: fromAddr,
        fromName,
        toAddresses,
        ccAddresses,
        subject,
        bodyText: parsed.text ?? '',
        bodyHtml: typeof parsed.html === 'string' ? parsed.html : '',
        hasAttachment: (parsed.attachments?.length ?? 0) > 0,
        receivedAt: parsed.date ?? msg.envelope?.date ?? new Date(),
      },
    });

    return true;
  }
}
