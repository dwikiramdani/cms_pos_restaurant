import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_ONE_GET_ONE = 'bogo',
}

export enum PromotionScope {
  ALL = 'all',
  CATEGORY = 'category',
  MENU_ITEM = 'menu_item',
  ORDER_TOTAL = 'order_total',
}

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'enum', enum: PromotionScope, default: PromotionScope.ALL })
  scope: PromotionScope;

  @Column({ type: 'jsonb', nullable: true })
  applicableItems: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscount: number;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
  };

  @Column({ type: 'int', default: 0 })
  usageLimit: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  branchId: string;

  @ManyToOne(() => Branch, (branch) => branch.promotions, { nullable: true })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
