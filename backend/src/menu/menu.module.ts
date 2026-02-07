import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Category } from './entities/category.entity';
import { MenuVariant } from './entities/menu-variant.entity';
import { MenuAddon } from './entities/menu-addon.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { CategoryController } from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, Category, MenuVariant, MenuAddon])],
  controllers: [MenuController, CategoryController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
