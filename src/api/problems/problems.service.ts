import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Problem } from 'src/schema/problem.schema';

@Injectable()
export class ProblemsService {
    constructor(
        @InjectModel(Problem.name, 'core')
        private problemModel: Model<Problem>,
    ) {}

    async findAll() {
        let problems = await this.problemModel.aggregate([
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
        ]);
        return {
            problems,
            total: problems.length,
            itemsPerPage: problems.length,
            page: 1,
        };
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
}
