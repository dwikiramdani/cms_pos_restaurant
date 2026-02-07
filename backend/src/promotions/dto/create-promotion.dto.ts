import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType, PromotionScope } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PromotionType })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ enum: PromotionScope })
  @IsOptional()
  @IsEnum(PromotionScope)
  scope?: PromotionScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  applicableItems?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minimumOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maximumDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  schedule?: {
    dayOfWeek: number[];
    startTime: string;
    endTime: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
