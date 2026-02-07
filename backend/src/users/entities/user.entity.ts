import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Order } from './order.entity';
import { Payment } from './payment.entity';
import { Promotion } from './promotion.entity';
import { MenuItem } from './menu-item.entity';
import { SystemSetting } from './system-setting.entity';
import { OrderItem } from './order-item.entity';

export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  KITCHEN = 'kitchen',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CASHIER })
  role: UserRole;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, (branch) => branch.users, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.createdBy)
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.processedBy)
  payments: Payment[];
}
