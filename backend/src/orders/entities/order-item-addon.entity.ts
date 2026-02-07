import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('order_item_addons')
export class OrderItemAddon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderItemId: string;

  @Column()
  addonId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.addons)
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItem;

  @CreateDateColumn()
  createdAt: Date;
}
