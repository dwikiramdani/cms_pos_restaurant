import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, OrderType } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemAddon } from './entities/order-item-addon.entity';
import { MenuService } from '../menu/menu.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto\update-order-status.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(OrderItemAddon)
    private orderItemAddonsRepository: Repository<OrderItemAddon>,
    private dataSource: DataSource,
    private menuService: MenuService,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderNumber = this.generateOrderNumber();
      
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        orderType: createOrderDto.orderType,
        tableNumber: createOrderDto.tableNumber,
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        notes: createOrderDto.notes,
        branchId: createOrderDto.branchId,
        createdById: userId,
        status: OrderStatus.NEW,
      });

      await queryRunner.manager.save(order);

      let subtotal = 0;

      for (const itemDto of createOrderDto.items) {
        const menuItem = await this.menuService.findMenuItemById(itemDto.menuItemId);
        
        let unitPrice = Number(menuItem.basePrice);
        
        if (itemDto.variantId) {
          const variant = menuItem.variants?.find(v => v.id === itemDto.variantId);
          if (variant) {
            unitPrice += Number(variant.priceModifier);
          }
        }

        const totalPrice = unitPrice * itemDto.quantity;
        subtotal += totalPrice;

        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: order.id,
          menuItemId: itemDto.menuItemId,
          variantId: itemDto.variantId,
          quantity: itemDto.quantity,
          unitPrice,
          totalPrice,
          notes: itemDto.notes,
          kitchenStatus: 'pending',
        });

        await queryRunner.manager.save(orderItem);

        if (itemDto.addons && itemDto.addons.length > 0) {
          for (const addonDto of itemDto.addons) {
            const addon = queryRunner.manager.create(OrderItemAddon, {
              orderItemId: orderItem.id,
              addonId: addonDto.addonId,
              name: addonDto.name,
              price: addonDto.price,
              quantity: addonDto.quantity || 1,
            });

            subtotal += Number(addonDto.price) * (addonDto.quantity || 1);
            await queryRunner.manager.save(addon);
          }
        }
      }

      const taxAmount = subtotal * 0.1;
      const totalAmount = subtotal + taxAmount;

      order.subtotal = subtotal;
      order.taxAmount = taxAmount;
      order.totalAmount = totalAmount;

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      const fullOrder = await this.findOne(order.id);
      
      this.websocketGateway.emitOrderCreated(fullOrder);

      return fullOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(branchId?: string, status?: OrderStatus): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.createdBy', 'createdBy')
      .orderBy('order.createdAt', 'DESC');

    if (branchId) {
      query.andWhere('order.branchId = :branchId', { branchId });
    }

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.addons', 'createdBy', 'payments'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.findOne(orderNumber);
    return order;
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.status;

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.NEW]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.COOKING, OrderStatus.CANCELLED],
      [OrderStatus.COOKING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.CANCELLED],
      [OrderStatus.SERVED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[oldStatus].includes(updateDto.status)) {
      throw new BadRequestException(`Cannot transition from ${oldStatus} to ${updateDto.status}`);
    }

    order.status = updateDto.status;

    if (updateDto.status === OrderStatus.COMPLETED) {
      order.completedAt = new Date();
    }

    if (updateDto.status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelledReason = updateDto.reason;
    }

    await this.ordersRepository.save(order);

    this.websocketGateway.emitOrderUpdated(order);

    return this.findOne(id);
  }

  async updateItemStatus(itemId: string, kitchenStatus: string): Promise<OrderItem> {
    const item = await this.orderItemsRepository.findOne({
      where: { id: itemId },
      relations: ['order'],
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    item.kitchenStatus = kitchenStatus;
    await this.orderItemsRepository.save(item);

    this.websocketGateway.emitOrderItemUpdated(item);

    return item;
  }

  async getActiveOrders(branchId?: string): Promise<Order[]> {
    return this.findAll(branchId, OrderStatus.NEW);
  }

  async getKitchenOrders(branchId?: string): Promise<Order[]> {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menuItem', 'menuItem')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.COOKING, OrderStatus.READY],
      })
      .orderBy('order.createdAt', 'ASC');

    if (branchId) {
      query.andWhere('order.branchId = :branchId', { branchId });
    }

    return query.getMany();
  }

  async getTodayOrders(branchId?: string): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .orderBy('order.createdAt', 'DESC');

    if (branchId) {
      query.andWhere('order.branchId = :branchId', { branchId });
    }

    return query.getMany();
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
  }
}
