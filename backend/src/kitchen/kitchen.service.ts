import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway,
  ) {}

  async getKitchenDisplay(branchId?: string): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menuItem', 'menuItem')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.COOKING],
      })
      .orderBy('order.createdAt', 'ASC');

    if (branchId) {
      query.andWhere('order.branchId = :branchId', { branchId });
    }

    return query.getMany();
  }

  async getReadyOrders(branchId?: string): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.status = :status', { status: OrderStatus.READY })
      .orderBy('order.updatedAt', 'ASC');

    if (branchId) {
      query.andWhere('order.branchId = :branchId', { branchId });
    }

    return query.getMany();
  }

  async startCooking(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.COOKING;
    await this.ordersRepository.save(order);

    for (const item of order.items) {
      item.kitchenStatus = 'preparing';
      await this.orderItemsRepository.save(item);
    }

    this.websocketGateway.emitOrderUpdated(order);

    const updatedOrder = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem'],
    });

    return updatedOrder as Order;
  }

  async markItemReady(itemId: string): Promise<OrderItem> {
    const item = await this.orderItemsRepository.findOne({
      where: { id: itemId },
      relations: ['order'],
    });

    if (!item) {
      throw new Error('Order item not found');
    }

    item.kitchenStatus = 'ready';
    await this.orderItemsRepository.save(item);

    this.websocketGateway.emitOrderItemUpdated(item);

    const allReady = await this.checkAllItemsReady(item.order.id);
    if (allReady) {
      await this.markOrderReady(item.order.id);
    }

    return item;
  }

  async markOrderReady(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.READY;
    await this.ordersRepository.save(order);

    this.websocketGateway.emitOrderUpdated(order);
    this.websocketGateway.emitOrderReady(order);

    return order;
  }

  async completeOrder(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.COMPLETED;
    order.completedAt = new Date();
    await this.ordersRepository.save(order);

    this.websocketGateway.emitOrderUpdated(order);

    return order;
  }

  private async checkAllItemsReady(orderId: string): Promise<boolean> {
    const items = await this.orderItemsRepository.find({
      where: { orderId },
    });

    return items.every((item) => item.kitchenStatus === 'ready');
  }

  async bumpOrder(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const statusFlow: Record<OrderStatus, OrderStatus> = {
      [OrderStatus.NEW]: OrderStatus.CONFIRMED,
      [OrderStatus.CONFIRMED]: OrderStatus.COOKING,
      [OrderStatus.COOKING]: OrderStatus.READY,
      [OrderStatus.READY]: OrderStatus.SERVED,
      [OrderStatus.SERVED]: OrderStatus.COMPLETED,
      [OrderStatus.COMPLETED]: OrderStatus.COMPLETED,
      [OrderStatus.CANCELLED]: OrderStatus.CANCELLED,
    };

    const newStatus = statusFlow[order.status];
    order.status = newStatus;

    if (newStatus === OrderStatus.SERVED) {
      order.completedAt = new Date();
    }

    await this.ordersRepository.save(order);
    this.websocketGateway.emitOrderUpdated(order);

    const updatedOrder = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem'],
    });

    return updatedOrder as Order;
  }
}
