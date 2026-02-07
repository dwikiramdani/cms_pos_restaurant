import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiQuery({ name: 'branchId', required: false })
  getAll(@Query('branchId') branchId?: string) {
    return this.settingsService.getAll(branchId);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiQuery({ name: 'branchId', required: false })
  get(@Param('key') key: string, @Query('branchId') branchId?: string) {
    return this.settingsService.get(key, branchId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Set setting' })
  set(@Body() updateDto: UpdateSettingDto) {
    return this.settingsService.set(
      updateDto.key,
      updateDto.value,
      updateDto.type,
      updateDto.branchId,
      updateDto.description,
    );
  }

  @Post('initialize')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Initialize default settings' })
  initializeDefaults() {
    return this.settingsService.initializeDefaults();
  }

  @Patch(':key')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update setting' })
  update(@Param('key') key: string, @Body() updateDto: UpdateSettingDto) {
    return this.settingsService.set(
      key,
      updateDto.value,
      updateDto.type,
      updateDto.branchId,
      updateDto.description,
    );
  }
}
