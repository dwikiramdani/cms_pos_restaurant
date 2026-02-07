import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { OrdersService } from '../orders/orders.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const order = await this.ordersService.findOne(createPaymentDto.orderId);

    if (order.status === 'completed') {
      throw new BadRequestException('Order is already completed');
    }

    const transactionId = this.generateTransactionId();
    
    const payment = this.paymentsRepository.create({
      transactionId,
      orderId: createPaymentDto.orderId,
      method: createPaymentDto.method,
      amount: createPaymentDto.amount || order.totalAmount,
      tip: createPaymentDto.tip || 0,
      referenceNumber: createPaymentDto.referenceNumber,
      notes: createPaymentDto.notes,
      processedById: userId,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    if (createPaymentDto.method === PaymentMethod.CASH) {
      await this.markAsCompleted(savedPayment.id);
    }

    return savedPayment;
  }

  async markAsCompleted(paymentId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.completedAt = new Date();
    await this.paymentsRepository.save(payment);

    await this.ordersService.updateStatus(payment.orderId, {
      status: 'completed' as any,
    });

    this.websocketGateway.emitPaymentCompleted(payment);

    return payment;
  }

  async processRefund(paymentId: string, amount: number, reason?: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    const remainingRefundable = Number(payment.amount) - Number(payment.refundAmount);
    if (amount > remainingRefundable) {
      throw new BadRequestException(`Refund amount exceeds available amount. Max: ${remainingRefundable}`);
    }

    payment.refundAmount = Number(payment.refundAmount) + amount;
    payment.refundedAt = new Date();
    
    if (Number(payment.refundAmount) >= Number(payment.amount)) {
      payment.status = PaymentStatus.REFUNDED;
    } else {
      payment.status = PaymentStatus.PARTIALLY_REFUNDED;
    }

    await this.paymentsRepository.save(payment);

    return payment;
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['order', 'processedBy'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getDailySummary(branchId?: string, date?: Date): Promise<any> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.completedAt >= :startOfDay', { startOfDay })
      .andWhere('payment.completedAt <= :endOfDay', { endOfDay });

    if (branchId) {
      query.innerJoin('payment.order', 'order').andWhere('order.branchId = :branchId', { branchId });
    }

    const payments = await query.getMany();

    const summary = {
      date: targetDate,
      totalTransactions: payments.length,
      totalAmount: 0,
      totalTip: 0,
      totalRefunds: 0,
      byMethod: {} as Record<string, number>,
    };

    for (const payment of payments) {
      summary.totalAmount += Number(payment.amount);
      summary.totalTip += Number(payment.tip);
      summary.totalRefunds += Number(payment.refundAmount);

      const method = payment.method;
      summary.byMethod[method] = (summary.byMethod[method] || 0) + Number(payment.amount);
    }

    return summary;
  }

  private generateTransactionId(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TXN-${dateStr}-${random}`;
  }
}
