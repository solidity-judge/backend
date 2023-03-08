import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Problem } from 'src/schema/problem.schema';
import { getAggregateProject } from '../helper';
import { UpdateProblemDto } from './updateProblem.dto';

export type ProblemFindAllFilter = {
    skip: number;
    limit: number;
    userAddress: string;
    filterSolved: boolean;
};

export type ProblemFastFindAllFilter = {
    skip: number;
    limit: number;
};

@Injectable()
export class ProblemsService {
    constructor(
        @InjectModel(Problem.name, 'core')
        private problemModel: Model<Problem>,
    ) {}

    async fastFindAll({ skip, limit }: ProblemFastFindAllFilter) {
        let [{ results, total }] = await this.problemModel.aggregate([
            {
                $match: {
                    isWhitelisted: true,
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
            problems: results,
        };
    }

    async findAll({
        skip,
        limit,
        userAddress,
        filterSolved,
    }: ProblemFindAllFilter) {
        if (userAddress == '') {
            return this.fastFindAll({ skip, limit });
        }

        const filters = [];
        if (filterSolved) {
            filters.push({
                $match: { 'submissions.0': { $exists: false } },
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
                },
            },
            ...getAggregateProject(skip, limit),
        ]);

        return { total: total, problems: results };
    }

    async findOne(id: number) {
        let results = await this.problemModel.aggregate([
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
        return results[0];
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
