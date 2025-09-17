import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Category } from 'src/category/category.entity';


@Injectable()
export class SubcategoryService {
  constructor(
    @InjectRepository(Subcategory)
    private repo: Repository<Subcategory>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateSubcategoryDto) {
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) {
      throw new NotFoundException(`Category #${dto.categoryId} not found`);
    }
  
    const sub = this.repo.create({ ...dto, category });
    return this.repo.save(sub);
  }
  

  findAll() {
    return this.repo.find({ relations: ['category'] });
  }

  async findOne(id: number) {
    const sub = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!sub) throw new NotFoundException(`Subcategory #${id} not found`);
    return sub;
  }

  async update(id: number, dto: UpdateSubcategoryDto) {
    const sub = await this.findOne(id);
    Object.assign(sub, dto);
    return this.repo.save(sub);
  }

  async remove(id: number) {
    const sub = await this.findOne(id);
    return this.repo.remove(sub);
  }
}
