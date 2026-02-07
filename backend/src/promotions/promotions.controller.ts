import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Promotions')
@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create promotion' })
  create(@Body() createDto: CreatePromotionDto) {
    return this.promotionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all promotions' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'activeOnly', required: false })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.promotionsService.findAll(branchId, activeOnly !== 'false');
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active promotions' })
  @ApiQuery({ name: 'branchId', required: false })
  getActive(@Query('branchId') branchId?: string) {
    return this.promotionsService.getActivePromotions(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update promotion' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePromotionDto) {
    return this.promotionsService.update(id, updateDto);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Toggle promotion active status' })
  toggleActive(@Param('id') id: string) {
    return this.promotionsService.toggleActive(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete promotion' })
  remove(@Param('id') id: string) {
    return this.promotionsService.delete(id);
  }
}
