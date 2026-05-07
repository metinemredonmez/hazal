import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSender } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSession(visitorId: string, info?: { visitorName?: string; visitorEmail?: string }) {
    return this.prisma.chatSession.upsert({
      where: { visitorId },
      update: {
        visitorName: info?.visitorName ?? undefined,
        visitorEmail: info?.visitorEmail ?? undefined,
      },
      create: {
        visitorId,
        visitorName: info?.visitorName,
        visitorEmail: info?.visitorEmail,
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

  async listSessions(opts: { closed?: boolean }) {
    const sessions = await this.prisma.chatSession.findMany({
      where: opts.closed === undefined ? {} : { closed: opts.closed },
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
      closed: s.closed,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      lastMessage: s.messages[0] ?? null,
      unreadCount: s._count.messages,
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
