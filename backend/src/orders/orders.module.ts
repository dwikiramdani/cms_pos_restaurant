import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemAddon } from './entities/order-item-addon.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { WebsocketModule } from '../websocket/websocket.module';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderItemAddon]),
    forwardRef(() => WebsocketModule),
    MenuModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
