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
import { Branch } from '../../branches/entities/branch.entity';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';

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
  branchId: string | null;

  @ManyToOne(() => Branch, (branch: any) => branch.users, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order: any) => order.createdBy)
  orders: Order[];

  @OneToMany(() => Payment, (payment: any) => payment.processedBy)
  payments: Payment[];
}
