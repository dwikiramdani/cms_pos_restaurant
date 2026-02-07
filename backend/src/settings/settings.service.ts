import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
  ) {}

  async get(key: string, branchId?: string): Promise<any> {
    const setting = await this.settingsRepository.findOne({
      where: { key, branchId: branchId || null },
    });

    if (!setting) {
      return null;
    }

    return this.parseValue(setting.value, setting.type);
  }

  async set(key: string, value: any, type: string = 'string', branchId?: string, description?: string): Promise<SystemSetting> {
    const stringValue = this.stringifyValue(value, type);
    
    const existing = await this.settingsRepository.findOne({
      where: { key, branchId: branchId || null },
    });

    if (existing) {
      existing.value = stringValue;
      return this.settingsRepository.save(existing);
    }

    const setting = this.settingsRepository.create({
      key,
      value: stringValue,
      type,
      branchId,
      description,
    });

    return this.settingsRepository.save(setting);
  }

  async getAll(branchId?: string): Promise<SystemSetting[]> {
    const query = this.settingsRepository
      .createQueryBuilder('setting')
      .where('setting.branchId = :branchId OR setting.branchId IS NULL', { branchId: branchId || null })
      .orderBy('setting.key', 'ASC');

    return query.getMany();
  }

  async initializeDefaults() {
    const defaults = [
      { key: 'tax_percentage', value: '10', type: 'number', description: 'Tax percentage' },
      { key: 'service_charge', value: '0', type: 'number', description: 'Service charge percentage' },
      { key: 'currency', value: 'IDR', type: 'string', description: 'Currency code' },
      { key: 'receipt_footer', value: 'Terima kasih atas kunjungan Anda!', type: 'string', description: 'Receipt footer text' },
      { key: 'operating_hours_start', value: '10:00', type: 'string', description: 'Operating hours start' },
      { key: 'operating_hours_end', value: '22:00', type: 'string', description: 'Operating hours end' },
    ];

    for (const defaultSetting of defaults) {
      await this.set(defaultSetting.key, defaultSetting.value, defaultSetting.type, null, defaultSetting.description);
    }
  }

  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private stringifyValue(value: any, type: string): string {
    switch (type) {
      case 'json':
        return JSON.stringify(value);
      case 'boolean':
        return value.toString();
      default:
        return String(value);
    }
  }
}
