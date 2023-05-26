import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Submission } from 'src/schema/submission.schema';
import { getAggregateProject } from '../helper';
export type SubmissionFindAllFilter = {
    skip: number;
    limit: number;
    userAddress: string;
    problemAddress: string;
};
@Injectable()
export class SubmissionsService {
    constructor(
        @InjectModel(Submission.name, 'core')
        private submissionModel: Model<Submission>,
    ) {}
    async findAll({
        skip,
        limit,
        userAddress,
        problemAddress,
    }: SubmissionFindAllFilter) {
        const filterStages = [];
        if (userAddress) {
            filterStages.push({
                $match: {
                    contestant: userAddress,
                },
            });
        }
        if (problemAddress) {
            filterStages.push({
                $match: {
                    problem: problemAddress,
                },
            });
        }

        const [{ results, total }] = await this.submissionModel.aggregate([
            ...filterStages,
            {
                $project: {
                    _id: 0,
                    user: '$contestant',
                    point: 1,
                    problem: 1,
                    solution: 1,
                    isPreDeadline: 1,
                    block: 1,
                    timestamp: 1,
                    txHash: 1,
                },
            },
            ...getAggregateProject(skip, limit, {
                timestamp: -1,
            }),
        ]);
        return {
            submissions: results,
            total,
        };
    }

    findOne(id: number) {
        return `This action returns a #${id} submission`;
    }
}
