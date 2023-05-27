import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contest } from 'src/schema/contest.schema';
import { getAggregateProject } from '../helper';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@Injectable()
export class ContestService {
    constructor(
        @InjectModel(Contest.name, 'core')
        private contestModel: Model<Contest>,
    ) {}
    async create(createContestDto: CreateContestDto) {
        const largestId = await this.contestModel
            .find()
            .sort({ id: -1 })
            .limit(1)
            .select('id')
            .exec();
        // largestId can be empty array
        const id = largestId.length ? largestId[0].id + 1 : 1;
        await this.contestModel.create({ ...createContestDto, id });
    }

    async findAll({ skip, limit }: { skip: number; limit: number }) {
        const [{ results, total }] = await this.contestModel.aggregate([
            {
                $project: {
                    _id: 0,
                },
            },
            ...getAggregateProject(skip, limit),
        ]);

        return {
            contests: results,
            total,
        };
    }

    async findOne(id: number) {
        return this.contestModel.findOne({ id }).exec();
    }

    async update(id: number, updateContestDto: UpdateContestDto) {
        await this.contestModel.updateOne({ id }, updateContestDto).exec();
    }

    async remove(id: number) {
        await this.contestModel.remove({ id }).exec();
    }
}
