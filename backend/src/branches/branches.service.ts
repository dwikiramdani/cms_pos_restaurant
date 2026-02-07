import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
  ) {}

  async create(createDto: CreateBranchDto): Promise<Branch> {
    const existingBranch = await this.branchesRepository.findOne({
      where: { code: createDto.code },
    });

    if (existingBranch) {
      throw new ConflictException('Branch code already exists');
    }

    const branch = this.branchesRepository.create(createDto);
    return this.branchesRepository.save(branch);
  }

  async findAll(): Promise<Branch[]> {
    return this.branchesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({
      where: { id },
      relations: ['users', 'menuItems'],
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async findByCode(code: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({
      where: { code },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(id: string, updateDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, updateDto);
    return this.branchesRepository.save(branch);
  }

  async deactivate(id: string): Promise<Branch> {
    const branch = await this.findOne(id);
    branch.isActive = false;
    return this.branchesRepository.save(branch);
  }

  async activate(id: string): Promise<Branch> {
    const branch = await this.findOne(id);
    branch.isActive = true;
    return this.branchesRepository.save(branch);
  }

  async delete(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchesRepository.remove(branch);
  }
}
