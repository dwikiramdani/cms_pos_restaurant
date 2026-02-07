import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(MenuItem)
    private menuItemsRepository: Repository<MenuItem>,
  ) {}

  async getSalesReport(branchId: string, startDate: Date, endDate: Date) {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt <= :endDate', { endDate })
      .andWhere('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.CANCELLED });

    const orders = await query.getMany();

    const summary = {
      period: { startDate, endDate },
      totalOrders: orders.length,
      totalRevenue: 0,
      totalTax: 0,
      totalDiscount: 0,
      totalServiceCharge: 0,
      averageOrderValue: 0,
      byOrderType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    for (const order of orders) {
      summary.totalRevenue += Number(order.totalAmount);
      summary.totalTax += Number(order.taxAmount);
      summary.totalDiscount += Number(order.discountAmount);
      summary.totalServiceCharge += Number(order.serviceCharge);

      const orderType = order.orderType;
      summary.byOrderType[orderType] = (summary.byOrderType[orderType] || 0) + 1;

      const status = order.status;
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    }

    summary.averageOrderValue = orders.length > 0 ? summary.totalRevenue / orders.length : 0;

    return summary;
  }

  async getDailySalesReport(branchId: string, date: Date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.getSalesReport(branchId, startDate, endDate);
  }

  async getMonthlySalesReport(branchId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.getSalesReport(branchId, startDate, endDate);
  }

  async getBestSellingItems(branchId: string, startDate: Date, endDate: Date, limit: number = 10) {
    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.items', 'items')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt <= :endDate', { endDate })
      .andWhere('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.CANCELLED })
      .getMany();

    const itemStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (!itemStats[item.menuItemId]) {
          const menuItem = await this.menuItemsRepository.findOne({
            where: { id: item.menuItemId },
          });
          itemStats[item.menuItemId] = {
            name: menuItem?.name || 'Unknown',
            quantity: 0,
            revenue: 0,
          };
        }
        itemStats[item.menuItemId].quantity += item.quantity;
        itemStats[item.menuItemId].revenue += Number(item.totalPrice);
      }
    }

    return Object.values(itemStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  async getPaymentSummary(branchId: string, startDate: Date, endDate: Date) {
    const query = this.paymentsRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.completedAt >= :startDate', { startDate })
      .andWhere('payment.completedAt <= :endDate', { endDate });

    const payments = await query.getMany();

    const summary = {
      period: { startDate, endDate },
      totalTransactions: payments.length,
      totalAmount: 0,
      totalTip: 0,
      totalRefunds: 0,
      byMethod: {} as Record<string, { count: number; amount: number }>,
    };

    for (const payment of payments) {
      summary.totalAmount += Number(payment.amount);
      summary.totalTip += Number(payment.tip);
      summary.totalRefunds += Number(payment.refundAmount);

      const method = payment.method;
      if (!summary.byMethod[method]) {
        summary.byMethod[method] = { count: 0, amount: 0 };
      }
      summary.byMethod[method].count += 1;
      summary.byMethod[method].amount += Number(payment.amount);
    }

    return summary;
  }

  async getCancelledOrdersReport(branchId: string, startDate: Date, endDate: Date) {
    const query = this.ordersRepository
      .createQueryBuilder('order')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt <= :endDate', { endDate })
      .andWhere('order.status = :status', { status: OrderStatus.CANCELLED })
      .orderBy('order.cancelledAt', 'DESC');

    return query.getMany();
  }

  async getHourlySalesReport(branchId: string, date: Date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt <= :endDate', { endDate })
      .andWhere('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.CANCELLED })
      .getMany();

    const hourlyData = Array(24).fill(null).map((_, hour) => ({
      hour,
      orders: 0,
      revenue: 0,
    }));

    for (const order of orders) {
      const hour = order.createdAt.getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += Number(order.totalAmount);
    }

    return hourlyData;
  }
}
