import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schema/category.schema';
import { Problem } from 'src/schema/problem.schema';
import { getAggregateProject } from '../helper';
import { UpdateProblemDto } from './updateProblem.dto';

export type ProblemFindAllFilter = {
    skip: number;
    limit: number;
    userAddress: string;
    filterSolved: boolean;
    category: string;
};

export type ProblemFastFindAllFilter = {
    skip: number;
    limit: number;
    category: string;
};

@Injectable()
export class ProblemsService {
    constructor(
        @InjectModel(Problem.name, 'core')
        private problemModel: Model<Problem>,
        @InjectModel(Category.name, 'core')
        private categoryModel: Model<Category>,
    ) {}

    async mapCategories(
        problems: { categories: (string | { key: string; name: string })[] }[],
    ) {
        const allCategories: { key: string; name: string }[] =
            await this.categoryModel.find({});
        const map = new Map<string, string>();
        allCategories.forEach((category) => {
            map.set(category.key, category.name);
        });
        problems.forEach((problem) => {
            const categories = problem.categories;
            problem.categories = categories.map((category) => ({
                key: category as string,
                name: map.get(category as string) ?? '?',
            }));
        });
        return problems;
    }

    async fastFindAll({ skip, limit, category }: ProblemFastFindAllFilter) {
        const filterStage = [];
        if (category) {
            filterStage.push({
                $match: {
                    categories: category,
                },
            });
        }

        const [{ results, total }] = await this.problemModel.aggregate([
            {
                $match: {
                    isWhitelisted: true,
                },
            },
            ...filterStage,
            {
                $project: {
                    _id: 0,
                    id: 1,
                    address: 1,
                    author: 1,
                    timestamp: 1,
                    title: 1,
                    categories: 1,
                },
            },
            {
                $set: {
                    solved: false,
                },
            },
            ...getAggregateProject(skip, limit),
        ]);
        return {
            total,
            problems: await this.mapCategories(results),
        };
    }

    async findAll({
        skip,
        limit,
        userAddress,
        filterSolved,
        category,
    }: ProblemFindAllFilter) {
        if (userAddress == '') {
            return this.fastFindAll({ skip, limit, category });
        }

        const filters = [];
        if (filterSolved) {
            filters.push({
                $match: { 'submissions.0': { $exists: false } },
            });
        }

        if (category) {
            filters.push({
                $match: {
                    categories: category,
                },
            });
        }

        // find all problems that the user has solved by looking up the
        // user's submission with the same version as problem.testVersion

        const [{ results, total }] = await this.problemModel.aggregate([
            {
                $match: {
                    isWhitelisted: true,
                },
            },
            {
                $lookup: {
                    from: 'submissions',
                    let: {
                        problemAddr: '$address',
                        testVersion: '$testVersion',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$problem', '$$problemAddr'] },
                                        { $eq: ['$version', '$$testVersion'] },
                                        { $eq: ['$contestant', userAddress] },
                                        { $eq: ['$point', 10_000] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                    as: 'submissions',
                },
            },
            ...filters,
            {
                $set: {
                    solved: {
                        $cond: {
                            if: {
                                $ne: ['$submissions', []],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    address: 1,
                    author: 1,
                    timestamp: 1,
                    title: 1,
                    solved: 1,
                    categories: 1,
                },
            },
            ...getAggregateProject(skip, limit),
        ]);

        return { total: total, problems: await this.mapCategories(results) };
    }

    async findOne(id: number) {
        const results = await this.problemModel.aggregate([
            {
                $match: {
                    id,
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
        ]);
        return (await this.mapCategories(results))[0];
    }

    async update(id: number, updateProblemDto: UpdateProblemDto) {
        await this.problemModel.updateOne(
            { id },
            {
                $set: updateProblemDto,
            },
        );
    }
}
