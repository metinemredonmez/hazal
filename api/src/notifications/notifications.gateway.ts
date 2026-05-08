import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

const ADMIN_ROOM = 'admin-notifications';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly auth: AuthService) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers.authorization?.replace(/^Bearer\s+/, '') as string | undefined);

    if (!token) {
      client.disconnect(true);
      return;
    }
    const admin = await this.auth.verifyAccessToken(token);
    if (!admin) {
      client.disconnect(true);
      return;
    }
    await client.join(ADMIN_ROOM);
    client.emit('connected', { adminId: admin.id });
    this.logger.debug(`Admin connected to notifications: ${admin.email}`);
  }

  handleDisconnect() {
    // no-op
  }

  /** Push a notification to all connected admins. */
  emitNotification(notification: any) {
    this.server?.to(ADMIN_ROOM).emit('notification', notification);
  }
}
