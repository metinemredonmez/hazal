import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatSender } from '@prisma/client';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { StartSessionDto, SendMessageDto, AdminReplyDto } from './dto/chat.dto';

const ADMIN_ROOM = 'admin';
const sessionRoom = (id: string) => `session:${id}`;

interface SocketData {
  role: 'visitor' | 'admin';
  adminId?: string;
  visitorId?: string;
  sessionId?: string;
}

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chat: ChatService,
    private readonly auth: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers.authorization?.replace(/^Bearer\s+/, '') as string | undefined);

    if (token) {
      const admin = await this.auth.verifyAccessToken(token);
      if (admin) {
        const data = client.data as SocketData;
        data.role = 'admin';
        data.adminId = admin.id;
        await client.join(ADMIN_ROOM);
        client.emit('admin:connected', { adminId: admin.id });
        this.logger.log(`Admin connected: ${admin.email}`);
        return;
      }
    }

    const visitorId = (client.handshake.query.visitorId as string | undefined)?.trim();
    if (!visitorId) {
      client.emit('error', { message: 'visitorId or admin token required' });
      client.disconnect(true);
      return;
    }

    const data = client.data as SocketData;
    data.role = 'visitor';
    data.visitorId = visitorId;

    const session = await this.chat.getOrCreateSession(visitorId);
    data.sessionId = session.id;
    await client.join(sessionRoom(session.id));
    client.emit('visitor:connected', { sessionId: session.id });
  }

  handleDisconnect(client: Socket) {
    const data = client.data as SocketData;
    this.logger.debug(`Disconnected (${data.role ?? 'unknown'})`);
  }

  @SubscribeMessage('visitor:start')
  async visitorStart(@ConnectedSocket() client: Socket, @MessageBody() body: StartSessionDto) {
    const data = client.data as SocketData;
    if (data.role !== 'visitor' || !body.visitorId) return;
    const session = await this.chat.getOrCreateSession(body.visitorId, {
      visitorName: body.visitorName,
      visitorEmail: body.visitorEmail,
    });
    data.sessionId = session.id;
    await client.join(sessionRoom(session.id));
    client.emit('visitor:session', session);

    // notify admins about identifying info update
    this.server.to(ADMIN_ROOM).emit('admin:session-updated', {
      id: session.id,
      visitorId: session.visitorId,
      visitorName: session.visitorName,
      visitorEmail: session.visitorEmail,
    });
  }

  @SubscribeMessage('visitor:message')
  async visitorMessage(@ConnectedSocket() client: Socket, @MessageBody() body: SendMessageDto) {
    const data = client.data as SocketData;
    if (data.role !== 'visitor') return;

    const session = await this.chat.getOrCreateSession(body.visitorId);
    const message = await this.chat.addMessage(session.id, ChatSender.VISITOR, body.content);

    this.server.to(sessionRoom(session.id)).emit('chat:message', { sessionId: session.id, message });
    this.server.to(ADMIN_ROOM).emit('admin:new-message', { sessionId: session.id, message });
  }

  @SubscribeMessage('admin:reply')
  async adminReply(@ConnectedSocket() client: Socket, @MessageBody() body: AdminReplyDto) {
    const data = client.data as SocketData;
    if (data.role !== 'admin') return;

    const message = await this.chat.addMessage(body.sessionId, ChatSender.ADMIN, body.content);
    this.server.to(sessionRoom(body.sessionId)).emit('chat:message', { sessionId: body.sessionId, message });
    this.server.to(ADMIN_ROOM).emit('admin:new-message', { sessionId: body.sessionId, message });
  }

  @SubscribeMessage('admin:join-session')
  async adminJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string },
  ) {
    const data = client.data as SocketData;
    if (data.role !== 'admin') return;
    await client.join(sessionRoom(body.sessionId));
    await this.chat.markRead(body.sessionId);
    this.server.to(ADMIN_ROOM).emit('admin:session-read', { sessionId: body.sessionId });
  }

  @SubscribeMessage('chat:typing')
  async typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string; typing: boolean },
  ) {
    const data = client.data as SocketData;
    const sender = data.role === 'admin' ? 'admin' : 'visitor';
    this.server.to(sessionRoom(body.sessionId)).emit('chat:typing', {
      sessionId: body.sessionId,
      sender,
      typing: body.typing,
    });
  }
}
