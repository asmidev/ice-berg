import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to real-time events: ${client.id}`);
    
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(tenantId);
    }
  }

  sendAlert(tenantId: string, alert: string) {
    this.server.to(tenantId).emit('alert', { message: alert, timestamp: new Date() });
  }
}
