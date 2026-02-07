import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionType, PromotionScope } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  async create(createDto: CreatePromotionDto): Promise<Promotion> {
    const promotion = this.promotionsRepository.create(createDto);
    return this.promotionsRepository.save(promotion);
  }

  async findAll(branchId?: string, activeOnly: boolean = true): Promise<Promotion[]> {
    const query = this.promotionsRepository
      .createQueryBuilder('promotion')
      .orderBy('promotion.createdAt', 'DESC');

    if (branchId) {
      query.where('(promotion.branchId = :branchId OR promotion.branchId IS NULL)', { branchId });
    }

    if (activeOnly) {
      query.andWhere('promotion.isActive = :isActive', { isActive: true });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return promotion;
  }

  async update(id: string, updateDto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);
    Object.assign(promotion, updateDto);
    return this.promotionsRepository.save(promotion);
  }

  async delete(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionsRepository.remove(promotion);
  }

  async toggleActive(id: string): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.isActive = !promotion.isActive;
    return this.promotionsRepository.save(promotion);
  }

  async calculateDiscount(
    promotionId: string,
    orderSubtotal: number,
  ): Promise<{ discount: number; promotion: Promotion }> {
    const promotion = await this.findOne(promotionId);

    if (!promotion.isActive) {
      return { discount: 0, promotion };
    }

    if (promotion.minimumOrderAmount && orderSubtotal < Number(promotion.minimumOrderAmount)) {
      return { discount: 0, promotion };
    }

    let discount = 0;

    switch (promotion.type) {
      case PromotionType.PERCENTAGE:
        discount = (Number(promotion.value) / 100) * orderSubtotal;
        break;
      case PromotionType.FIXED_AMOUNT:
        discount = Number(promotion.value);
        break;
      case PromotionType.BUY_ONE_GET_ONE:
        discount = 0;
        break;
    }

    if (promotion.maximumDiscount && discount > Number(promotion.maximumDiscount)) {
      discount = Number(promotion.maximumDiscount);
    }

    if (discount > orderSubtotal) {
      discount = orderSubtotal;
    }

    return { discount, promotion };
  }

  async getActivePromotions(branchId?: string): Promise<Promotion[]> {
    return this.findAll(branchId, true);
  }
}
