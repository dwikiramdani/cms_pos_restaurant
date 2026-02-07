import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity('menu_variants')
export class MenuVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceModifier: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column()
  menuItemId: string;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.variants)
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuItem;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
