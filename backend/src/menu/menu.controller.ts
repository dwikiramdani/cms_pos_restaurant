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
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Menu')
@Controller('menu/items')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create menu item' })
  create(@Body() createDto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.menuService.findAllMenuItems(branchId, categoryId);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular menu items' })
  @ApiQuery({ name: 'branchId', required: false })
  getPopular(@Query('branchId') branchId?: string) {
    return this.menuService.getPopularItems(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  findOne(@Param('id') id: string) {
    return this.menuService.findMenuItemById(id);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update menu item' })
  update(@Param('id') id: string, @Body() updateDto: UpdateMenuItemDto) {
    return this.menuService.updateMenuItem(id, updateDto);
  }

  @Patch(':id/toggle-availability')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER)
  @ApiOperation({ summary: 'Toggle menu item availability' })
  toggleAvailability(@Param('id') id: string) {
    return this.menuService.toggleAvailability(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete menu item' })
  remove(@Param('id') id: string) {
    return this.menuService.deleteMenuItem(id);
  }
}
