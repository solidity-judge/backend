import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schema/category.schema';
import { getAggregateProject } from '../helper';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export type CategoryFindAllFilter = {
    skip: number;
    limit: number;
};
@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name, 'core')
        private categoryModel: Model<Category>,
    ) {}
    async create(createCategoryDto: CreateCategoryDto) {
        console.log(createCategoryDto);
        await this.categoryModel.create(createCategoryDto);
        return 'Success';
    }

    async findAll({ skip, limit }: CategoryFindAllFilter) {
        const [{ results, total }] = await this.categoryModel.aggregate([
            {
                $project: {
                    _id: 0,
                    key: 1,
                    name: 1,
                },
            },
            ...getAggregateProject(skip, limit),
        ]);
        return results;
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
