import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebsocketGateway');
  private connectedClients: Map<string, { socket: Socket; branchId?: string; role?: string }> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('joinKitchen')
  handleJoinKitchen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { branchId?: string; role?: string },
  ) {
    const room = data.branchId ? `kitchen:${data.branchId}` : 'kitchen:all';
    client.join(room);
    
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.branchId = data.branchId;
      clientData.role = data.role;
    }

    this.logger.log(`Client ${client.id} joined ${room}`);
    return { event: 'joined', data: { room } };
  }

  @SubscribeMessage('joinOrderUpdates')
  handleJoinOrderUpdates(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { branchId?: string },
  ) {
    const room = data.branchId ? `orders:${data.branchId}` : 'orders:all';
    client.join(room);
    return { event: 'joined', data: { room } };
  }

  emitOrderCreated(order: any) {
    const room = order.branchId ? `orders:${order.branchId}` : 'orders:all';
    this.server.to(room).emit('order:created', order);
    
    const kitchenRoom = order.branchId ? `kitchen:${order.branchId}` : 'kitchen:all';
    this.server.to(kitchenRoom).emit('kitchen:newOrder', order);

    this.logger.log(`Emitted order:created for order ${order.orderNumber}`);
  }

  emitOrderUpdated(order: any) {
    const room = order.branchId ? `orders:${order.branchId}` : 'orders:all';
    this.server.to(room).emit('order:updated', order);

    if (order.status === 'ready') {
      const kitchenRoom = order.branchId ? `kitchen:${order.branchId}` : 'kitchen:all';
      this.server.to(kitchenRoom).emit('kitchen:orderReady', order);
    }

    this.logger.log(`Emitted order:updated for order ${order.orderNumber}`);
  }

  emitOrderItemUpdated(item: any) {
    const order = item.order;
    if (order) {
      const room = order.branchId ? `orders:${order.branchId}` : 'orders:all';
      this.server.to(room).emit('order:itemUpdated', item);

      const kitchenRoom = order.branchId ? `kitchen:${order.branchId}` : 'kitchen:all';
      this.server.to(kitchenRoom).emit('kitchen:itemUpdated', item);
    }
  }

  emitOrderReady(order: any) {
    const room = order.branchId ? `orders:${order.branchId}` : 'orders:all';
    this.server.to(room).emit('order:ready', order);
    this.server.emit('notification:orderReady', {
      orderNumber: order.orderNumber,
      message: `Order ${order.orderNumber} is ready for pickup`,
    });
  }

  emitPaymentCompleted(payment: any) {
    const room = payment.order?.branchId ? `orders:${payment.order.branchId}` : 'orders:all';
    this.server.to(room).emit('payment:completed', payment);
    this.logger.log(`Emitted payment:completed for transaction ${payment.transactionId}`);
  }

  emitMenuUpdated(branchId?: string) {
    const room = branchId ? `menu:${branchId}` : 'menu:all';
    this.server.to(room).emit('menu:updated');
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: { timestamp: Date.now() } };
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getClientsByBranch(branchId: string): number {
    let count = 0;
    for (const data of this.connectedClients.values()) {
      if (data.branchId === branchId) {
        count++;
      }
    }
    return count;
  }
}
