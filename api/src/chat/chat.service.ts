import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSender, ChatChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSession(
    visitorId: string,
    info?: {
      visitorName?: string;
      visitorEmail?: string;
      visitorPhone?: string;
      channel?: ChatChannel;
    },
  ) {
    return this.prisma.chatSession.upsert({
      where: { visitorId },
      update: {
        visitorName: info?.visitorName ?? undefined,
        visitorEmail: info?.visitorEmail ?? undefined,
        visitorPhone: info?.visitorPhone ?? undefined,
        channel: info?.channel ?? undefined,
      },
      create: {
        visitorId,
        visitorName: info?.visitorName,
        visitorEmail: info?.visitorEmail,
        visitorPhone: info?.visitorPhone,
        channel: info?.channel ?? ChatChannel.WEB,
      },
    });
  }

  /** Manuel kayıt — admin paneli telefon/diğer için. */
  async createManualSession(input: {
    channel: ChatChannel;
    visitorName?: string;
    visitorPhone?: string;
    visitorEmail?: string;
    note: string;
  }) {
    const visitorId = `manual-${input.channel.toLowerCase()}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const session = await this.prisma.chatSession.create({
      data: {
        visitorId,
        visitorName: input.visitorName,
        visitorPhone: input.visitorPhone,
        visitorEmail: input.visitorEmail,
        channel: input.channel,
      },
    });
    if (input.note?.trim()) {
      await this.prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: ChatSender.ADMIN,
          content: input.note,
          read: true,
        },
      });
    }
    return session;
  }

  /** Sonuncu mesajı admin notu olarak ekler (manuel session'a follow-up). */
  async appendAdminNote(sessionId: string, note: string) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        sender: ChatSender.ADMIN,
        content: note,
        read: true,
      },
    });
  }

  async addMessage(sessionId: string, sender: ChatSender, content: string) {
    const message = await this.prisma.chatMessage.create({
      data: { sessionId, sender, content, read: sender === ChatSender.ADMIN },
    });
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });
    return message;
  }

  async getSessionByVisitor(visitorId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { visitorId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return session;
  }

  async getSessionById(id: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async listSessions(opts: { closed?: boolean; channel?: string }) {
    const where: Record<string, unknown> = {};
    if (opts.closed !== undefined) where.closed = opts.closed;
    if (opts.channel) where.channel = opts.channel;

    const sessions = await this.prisma.chatSession.findMany({
      where,
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: { where: { read: false, sender: ChatSender.VISITOR } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      visitorId: s.visitorId,
      visitorName: s.visitorName,
      visitorEmail: s.visitorEmail,
      visitorPhone: s.visitorPhone,
      channel: s.channel,
      externalRef: s.externalRef,
      closed: s.closed,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      lastMessage: s.messages[0] ?? null,
      unreadCount: s._count.messages,
    }));
  }

  async channelStats() {
    const grouped = await this.prisma.chatSession.groupBy({
      by: ['channel'],
      _count: { _all: true },
    });
    return grouped.map((g) => ({
      channel: g.channel,
      count: g._count._all,
    }));
  }

  async markRead(sessionId: string) {
    await this.prisma.chatMessage.updateMany({
      where: { sessionId, sender: ChatSender.VISITOR, read: false },
      data: { read: true },
    });
    return { ok: true };
  }

  async closeSession(sessionId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { closed: true },
    });
  }

  async unreadCount() {
    return this.prisma.chatMessage.count({
      where: { sender: ChatSender.VISITOR, read: false },
    });
  }
}
