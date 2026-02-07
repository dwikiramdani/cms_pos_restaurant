import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Create new order' })
  create(@Body() createDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(branchId, status);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today orders' })
  @ApiQuery({ name: 'branchId', required: false })
  getToday(@Query('branchId') branchId?: string) {
    return this.ordersService.getTodayOrders(branchId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active orders' })
  @ApiQuery({ name: 'branchId', required: false })
  getActive(@Query('branchId') branchId?: string) {
    return this.ordersService.getActiveOrders(branchId);
  }

  @Get('kitchen')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Get kitchen orders' })
  @ApiQuery({ name: 'branchId', required: false })
  getKitchenOrders(@Query('branchId') branchId?: string) {
    return this.ordersService.getKitchenOrders(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id/status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateDto);
  }

  @Patch(':id/items/:itemId/status')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Update order item kitchen status' })
  updateItemStatus(
    @Param('itemId') itemId: string,
    @Body('kitchenStatus') kitchenStatus: string,
  ) {
    return this.ordersService.updateItemStatus(itemId, kitchenStatus);
  }
}
