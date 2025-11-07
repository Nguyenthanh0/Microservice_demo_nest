import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class OrderGateway {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(OrderGateway.name);

  sendOrderStatus(orderId: string, status: string, userId: string) {
    this.server.emit('orderStatus', {
      userId,
      orderId,
      newStatus: status,
      message: `Order ${orderId} is now ${status}`,
    });
    this.logger.debug(
      `Emitted order-status for orderId: ${orderId}, status: ${status}`,
    );
  }
}
