import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get sales report' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getSalesReport(
    @Query('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getSalesReport(branchId, new Date(startDate), new Date(endDate));
  }

  @Get('sales/daily')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get daily sales report' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'date', required: true })
  getDailySales(
    @Query('branchId') branchId: string,
    @Query('date') date: string,
  ) {
    return this.reportsService.getDailySalesReport(branchId, new Date(date));
  }

  @Get('sales/monthly')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get monthly sales report' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  getMonthlySales(
    @Query('branchId') branchId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlySalesReport(branchId, parseInt(year), parseInt(month));
  }

  @Get('best-selling')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get best selling items' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'limit', required: false })
  getBestSelling(
    @Query('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getBestSellingItems(
      branchId,
      new Date(startDate),
      new Date(endDate),
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('payments')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get payment summary' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getPaymentSummary(
    @Query('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getPaymentSummary(branchId, new Date(startDate), new Date(endDate));
  }

  @Get('cancelled')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get cancelled orders report' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getCancelledOrders(
    @Query('branchId') branchId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getCancelledOrdersReport(branchId, new Date(startDate), new Date(endDate));
  }

  @Get('hourly')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get hourly sales report' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'date', required: true })
  getHourlySales(
    @Query('branchId') branchId: string,
    @Query('date') date: string,
  ) {
    return this.reportsService.getHourlySalesReport(branchId, new Date(date));
  }
}
