import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { MenuVariant } from './menu-variant.entity';
import { MenuAddon } from './menu-addon.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isPopular: boolean;

  @Column({ default: false })
  isNew: boolean;

  @Column({ type: 'int', default: 0 })
  preparationTime: number;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, (branch) => branch.menuItems, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @OneToMany(() => MenuVariant, (variant) => variant.menuItem)
  variants: MenuVariant[];

  @OneToMany(() => MenuAddon, (addon) => addon.menuItem)
  addons: MenuAddon[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
