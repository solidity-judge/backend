import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getAggregateProject } from '../helper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

export type CategoryFindAllFilter = {
  skip: number;
  limit: number;
}
@Injectable()
export class CategoryService {
  constructor(
      @InjectModel(Category.name, 'core')
      private categoryModel: Model<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    await this.categoryModel.create(createCategoryDto);
    return 'Success';
  }

  async findAll({ skip, limit }: CategoryFindAllFilter) {
    let [{ results, total }] = await this.categoryModel.aggregate([
      {
        $project: {
          _id: 0,
          key: 1,
          name: 1,
        },
      },
      ...getAggregateProject(skip, limit)
    ]);
    return {
      total,
      categories: results,
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} category`;
  // }

  async update(key: string, updateCategoryDto: UpdateCategoryDto) {
    await this.categoryModel.updateOne({ key }, updateCategoryDto);
  }

  async remove(key: string) {
    await this.categoryModel.deleteOne({ key });
  }
}
