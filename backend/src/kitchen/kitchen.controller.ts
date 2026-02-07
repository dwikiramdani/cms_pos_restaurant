import { Controller, Get, Post, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { KitchenService } from './kitchen.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Kitchen')
@Controller('kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('display')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Get kitchen display orders' })
  @ApiQuery({ name: 'branchId', required: false })
  getDisplay(@Query('branchId') branchId?: string) {
    return this.kitchenService.getKitchenDisplay(branchId);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Get ready orders' })
  @ApiQuery({ name: 'branchId', required: false })
  getReady(@Query('branchId') branchId?: string) {
    return this.kitchenService.getReadyOrders(branchId);
  }

  @Post(':orderId/start')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Start cooking order' })
  startCooking(@Param('orderId') orderId: string) {
    return this.kitchenService.startCooking(orderId);
  }

  @Post('items/:itemId/ready')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Mark item as ready' })
  markItemReady(@Param('itemId') itemId: string) {
    return this.kitchenService.markItemReady(itemId);
  }

  @Post(':orderId/ready')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Mark order as ready' })
  markOrderReady(@Param('orderId') orderId: string) {
    return this.kitchenService.markOrderReady(orderId);
  }

  @Post(':orderId/bump')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Bump order to next status' })
  bumpOrder(@Param('orderId') orderId: string) {
    return this.kitchenService.bumpOrder(orderId);
  }

  @Post(':orderId/complete')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Complete order' })
  completeOrder(@Param('orderId') orderId: string) {
    return this.kitchenService.completeOrder(orderId);
  }
}
