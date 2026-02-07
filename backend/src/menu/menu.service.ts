import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Category } from './entities/category.entity';
import { MenuVariant } from './entities/menu-variant.entity';
import { MenuAddon } from './entities/menu-addon.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(MenuVariant)
    private variantRepository: Repository<MenuVariant>,
    @InjectRepository(MenuAddon)
    private addonRepository: Repository<MenuAddon>,
  ) {}

  async createMenuItem(createDto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = this.menuItemRepository.create(createDto);
    return this.menuItemRepository.save(menuItem);
  }

  async findAllMenuItems(branchId?: string, categoryId?: string): Promise<MenuItem[]> {
    const query = this.menuItemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.variants', 'variants')
      .leftJoinAndSelect('item.addons', 'addons')
      .where('item.isAvailable = :isAvailable', { isAvailable: true })
      .orderBy('item.sortOrder', 'ASC');

    if (branchId) {
      query.andWhere('(item.branchId = :branchId OR item.branchId IS NULL)', { branchId });
    }

    if (categoryId) {
      query.andWhere('item.categoryId = :categoryId', { categoryId });
    }

    return query.getMany();
  }

  async findMenuItemById(id: string): Promise<MenuItem> {
    const item = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['variants', 'addons'],
    });

    if (!item) {
      throw new NotFoundException('Menu item not found');
    }

    return item;
  }

  async updateMenuItem(id: string, updateDto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findMenuItemById(id);
    Object.assign(item, updateDto);
    return this.menuItemRepository.save(item);
  }

  async deleteMenuItem(id: string): Promise<void> {
    const item = await this.findMenuItemById(id);
    await this.menuItemRepository.remove(item);
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    const item = await this.findMenuItemById(id);
    item.isAvailable = !item.isAvailable;
    return this.menuItemRepository.save(item);
  }

  async createCategory(createDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createDto);
    return this.categoryRepository.save(category);
  }

  async findAllCategories(branchId?: string): Promise<Category[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.isActive = :isActive', { isActive: true })
      .orderBy('category.sortOrder', 'ASC');

    if (branchId) {
      query.andWhere('(category.branchId = :branchId OR category.branchId IS NULL)', { branchId });
    }

    return query.getMany();
  }

  async findCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['menuItems'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findCategoryById(id);
    Object.assign(category, updateDto);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    await this.categoryRepository.remove(category);
  }

  async createVariant(menuItemId: string, name: string, priceModifier: number): Promise<MenuVariant> {
    const variant = this.variantRepository.create({
      menuItemId,
      name,
      priceModifier,
    });
    return this.variantRepository.save(variant);
  }

  async createAddon(menuItemId: string, name: string, price: number): Promise<MenuAddon> {
    const addon = this.addonRepository.create({
      menuItemId,
      name,
      price,
    });
    return this.addonRepository.save(addon);
  }

  async getPopularItems(branchId?: string, limit: number = 10): Promise<MenuItem[]> {
    const query = this.menuItemRepository
      .createQueryBuilder('item')
      .where('item.isPopular = :isPopular', { isPopular: true })
      .andWhere('item.isAvailable = :isAvailable', { isAvailable: true })
      .orderBy('item.sortOrder', 'ASC')
      .take(limit);

    if (branchId) {
      query.andWhere('(item.branchId = :branchId OR item.branchId IS NULL)', { branchId });
    }

    return query.getMany();
  }
}
