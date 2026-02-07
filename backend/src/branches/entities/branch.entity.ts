import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { SystemSetting } from '../../settings/entities/system-setting.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  operatingHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user: any) => user.branch)
  users: User[];

  @OneToMany(() => MenuItem, (menuItem: any) => menuItem.branch)
  menuItems: MenuItem[];

  @OneToMany(() => SystemSetting, (setting: any) => setting.branch)
  settings: SystemSetting[];

  @OneToMany(() => Promotion, (promotion: any) => promotion.branch)
  promotions: Promotion[];
}
