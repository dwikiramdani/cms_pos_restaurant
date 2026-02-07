import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { MenuVariant } from '../../menu/entities/menu-variant.entity';
import { OrderItemAddon } from './order-item-addon.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  menuItemId: string;

  @Column({ nullable: true })
  variantId: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: ['pending', 'preparing', 'ready', 'served'], default: 'pending' })
  kitchenStatus: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;

  @ManyToOne(() => MenuVariant, { nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant: MenuVariant;

  @OneToMany(() => OrderItemAddon, (addon) => addon.orderItem, { cascade: true })
  addons: OrderItemAddon[];

  @CreateDateColumn()
  createdAt: Date;
}
