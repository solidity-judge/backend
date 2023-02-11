import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.shema';
import { getAggregateProject } from '../helper';

export type UserFindAllFilter = {
    skip: number;
    limit: number;
};

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name, 'core')
        private userModel: Model<User>,
    ) {}
    async findAll({ skip, limit }: UserFindAllFilter) {
        let [{ results, total }] = await this.userModel.aggregate([
            {
                $lookup: {
                    from: 'submissions',
                    let: {
                        userAddr: '$address',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$contestant', '$$userAddr'] },
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
            {
                $set: {
                    submissionsCount: {
                        $size: '$submissions',
                    },
                    solvedCount: 5,
                },
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    address: 1,
                    submissionsCount: 1,
                    solvedCount: 1,
                },
            },
            ...getAggregateProject(skip, limit, { submissionsCount: -1 }),
        ]);
        return {
            total,
            users: results,
        };
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }
}
