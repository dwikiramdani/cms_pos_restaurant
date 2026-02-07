import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create branch' })
  create(@Body() createDto: CreateBranchDto) {
    return this.branchesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get branch by code' })
  findByCode(@Param('code') code: string) {
    return this.branchesService.findByCode(code);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update branch' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBranchDto) {
    return this.branchesService.update(id, updateDto);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate branch' })
  deactivate(@Param('id') id: string) {
    return this.branchesService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate branch' })
  activate(@Param('id') id: string) {
    return this.branchesService.activate(id);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete branch' })
  remove(@Param('id') id: string) {
    return this.branchesService.delete(id);
  }
}
