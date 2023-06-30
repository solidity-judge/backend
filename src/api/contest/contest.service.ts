import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contest } from 'src/schema/contest.schema';
import { Problem } from 'src/schema/problem.schema';
import { Submission } from 'src/schema/submission.schema';
import { getAggregateProject } from '../helper';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@Injectable()
export class ContestService {
    constructor(
        @InjectModel(Contest.name, 'core')
        private contestModel: Model<Contest>,
        @InjectModel(Submission.name, 'core')
        private submissionModel: Model<Submission>,
        @InjectModel(Problem.name, 'core')
        private problemModel: Model<Problem>,
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

    async ranking(id: number) {
        type Submission = {
            point: number;
            timestamp: Date;
            solution: string;
        };
        type UserRanking = {
            contestant: string;
            address: string;
            totalPoints: number;
            submissions: (Submission | undefined)[];
        };

        type Ranking = UserRanking[];

        // First: find all submissions of problems in this contest
        const contest = await this.findOne(id);
        if (!contest) throw new Error('Contest not found');
        const problems = await this.problemModel.find({
            id: {
                $in: contest.problems,
            },
        });

        const problem_addresses = problems.map((problem) => problem.address);
        console.log(problem_addresses);

        type AggregateResult = {
            _id: {
                problem: string;
                contestant: string;
            };
            point: number;
            timestamp: Date;
            solution: string;
        };
        // group submissions by user, problem
        // get the best point of each user, problem
        const submissions =
            await this.submissionModel.aggregate<AggregateResult>([
                {
                    $match: {
                        problem: {
                            $in: problem_addresses,
                        },
                        // TODO: uncomment this after we have some pre-deadline submissions
                        // isPreDeadline: true,
                    },
                },
                // order by point desc
                {
                    $sort: {
                        point: -1,
                    },
                },
                {
                    $group: {
                        _id: {
                            problem: '$problem',
                            contestant: '$contestant',
                        },
                        point: {
                            $first: '$point',
                        },
                        timestamp: {
                            $first: '$timestamp',
                        },
                        solution: {
                            $first: '$solution',
                        },
                    },
                },
            ]);

        // create a map (user, problem) -> submission
        const submissionMap = new Map<string, Submission>();
        // user points
        const userPoints = new Map<string, number>();
        for (const submission of submissions) {
            submissionMap.set(
                `${submission._id.contestant}-${submission._id.problem}`,
                {
                    point: submission.point,
                    timestamp: submission.timestamp,
                    solution: submission.solution,
                },
            );
            if (!userPoints.has(submission._id.contestant)) {
                userPoints.set(submission._id.contestant, 0);
            }
            userPoints.set(
                submission._id.contestant,
                userPoints.get(submission._id.contestant)! + submission.point,
            );
        }

        // sort by points desc
        const sortedUserPoints = Array.from(userPoints.entries()).sort(
            (a, b) => b[1] - a[1],
        );

        // get user ranking
        const ranking: Ranking = [];
        for (const [address, points] of sortedUserPoints) {
            const submissions = [];
            for (const problem of problems) {
                submissions.push(
                    submissionMap.get(`${address}-${problem.address}`),
                );
            }
            ranking.push({
                contestant: address,
                address,
                submissions,
                totalPoints: points,
            });
        }
        return ranking;
    }
}
