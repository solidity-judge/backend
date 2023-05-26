import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import request from 'graphql-request';
import { Model } from 'mongoose';
import { Problem, ProblemDocument } from 'src/schema/problem.schema';
import {
    SyncMetadata,
    SyncMetadataDocument,
} from 'src/schema/syncMetadata.schema';
import { BundleDto } from './dtos/bundle.dto';
import { ProblemDto } from './dtos/problem.dto';
import { BUNDLES_QUERY } from './queries/bundles';
import { PROBLEMS_QUERY } from './queries/problems';
import { AnyBulkWriteOperation } from 'mongodb';
import { SubmissionDto } from './dtos/submission.dto';
import { SUBMISSIONS_QUERY } from './queries/submissions';
import { Submission, SubmissionDocument } from 'src/schema/submission.schema';
import { TestVersionDto } from './dtos/testVersion.dto';
import { TEST_VERSIONS_QUERY } from './queries/testVersions';
import { UserDto } from './dtos/user.dto';
import { USERS_QUERY } from './queries/user';
import { User, UserDocument } from 'src/schema/user.shema';
import { ProblemDeadlineDto } from './dtos/problemDeadline.dto';
import { PROBLEM_DEADLINES_QUERY } from './queries/problemDeadlines';

const SUBGRAPH_URL =
    'https://api.thegraph.com/subgraphs/name/leduythuccs/solidity-judge';
const SUBGRAPH_FETCH_LIMIT = 1_000;

@Injectable()
export class SubgraphService {
    constructor(
        @InjectModel(SyncMetadata.name, 'core')
        private syncMetadataModel: Model<SyncMetadataDocument>,
        @InjectModel(Problem.name, 'core')
        private problemModel: Model<ProblemDocument>,
        @InjectModel(Submission.name, 'core')
        private submissionModel: Model<SubmissionDocument>,
        @InjectModel(User.name, 'core')
        private userModel: Model<UserDocument>,
    ) {}

    @Cron('*/30 * * * * *')
    async handleCron() {
        const localBundle = await this.getSyncMetadata();
        const remoteBundle = await this.getBundle();

        await this.pullProblems(
            localBundle['problems'] ?? 0,
            remoteBundle['problems'] ?? 0,
        );

        await this.pullUsers(
            localBundle['users'] ?? 0,
            remoteBundle['users'] ?? 0,
        );

        await this.pullSubmissions(
            localBundle['submissions'] ?? 0,
            remoteBundle['submissions'] ?? 0,
        );

        await this.pullTestVersions(
            localBundle['testVersions'] ?? 0,
            remoteBundle['testVersions'] ?? 0,
        );

        await this.pullProblemDeadlines(
            localBundle['problemDeadlines'] ?? 0,
            remoteBundle['problemDeadlines'] ?? 0,
        );
    }

    async pullProblems(local: number, remote: number) {
        if (remote <= local) return;
        console.log(`Pulling problems from ${local} to ${remote}...`);
        for (let i = local; i < remote; i += SUBGRAPH_FETCH_LIMIT) {
            const endpoint = SUBGRAPH_URL;
            const data = await request<{ data: ProblemDto[] }>(
                endpoint,
                PROBLEMS_QUERY,
                {
                    first: SUBGRAPH_FETCH_LIMIT,
                    lastSyncingIndex: i,
                },
            );
            const operations: AnyBulkWriteOperation<any>[] = data.data.map(
                (doc) => {
                    const id = parseInt(doc.syncingIndex);
                    return {
                        updateOne: {
                            filter: { id },
                            update: {
                                $setOnInsert: {
                                    id,
                                    author: doc.author,
                                    address: doc.address,
                                    checker: doc.checker,

                                    block: parseInt(doc.block),
                                    timestamp: new Date(
                                        parseInt(doc.timestamp) * 1000,
                                    ),
                                    txHash: doc.txHash,
                                },
                            },
                            upsert: true,
                        },
                    };
                },
            );

            await this.problemModel.bulkWrite(operations);
            const lastSyncingIndex = parseInt(
                data.data[data.data.length - 1].syncingIndex,
            );
            await this.syncMetadataModel.updateOne(
                {},
                { problems: lastSyncingIndex },
                { upsert: true },
            );
        }
    }

    async pullSubmissions(local: number, remote: number) {
        if (remote <= local) return;
        console.log(`Pulling submissions from ${local} to ${remote}...`);
        for (let i = local; i < remote; i += SUBGRAPH_FETCH_LIMIT) {
            const endpoint = SUBGRAPH_URL;
            const data = await request<{ data: SubmissionDto[] }>(
                endpoint,
                SUBMISSIONS_QUERY,
                {
                    first: SUBGRAPH_FETCH_LIMIT,
                    lastSyncingIndex: i,
                },
            );
            const operations: AnyBulkWriteOperation<any>[] = data.data.map(
                (doc) => {
                    const id = doc.id;
                    return {
                        updateOne: {
                            filter: { id },
                            update: {
                                $setOnInsert: {
                                    id,
                                    problem: doc.problem,
                                    solution: doc.solution,
                                    point: parseInt(doc.point),
                                    contestant: doc.contestant,
                                    // verdicts: doc.verdicts,
                                    version: parseInt(doc.version),

                                    block: parseInt(doc.block),
                                    timestamp: new Date(
                                        parseInt(doc.timestamp) * 1000,
                                    ),
                                    txHash: doc.txHash,
                                },
                            },
                            upsert: true,
                        },
                    };
                },
            );

            await this.submissionModel.bulkWrite(operations);
            const lastSyncingIndex = parseInt(
                data.data[data.data.length - 1].syncingIndex,
            );
            await this.syncMetadataModel.updateOne(
                {},
                { submissions: lastSyncingIndex },
                { upsert: true },
            );
        }
    }

    async pullTestVersions(local: number, remote: number) {
        if (remote <= local) return;
        console.log(`Pulling test versions from ${local} to ${remote}...`);
        for (let i = local; i < remote; i += SUBGRAPH_FETCH_LIMIT) {
            const endpoint = SUBGRAPH_URL;
            const data = await request<{ data: TestVersionDto[] }>(
                endpoint,
                TEST_VERSIONS_QUERY,
                {
                    first: SUBGRAPH_FETCH_LIMIT,
                    lastSyncingIndex: i,
                },
            );
            const testVersions: TestVersionDto[] = [];
            // make sure we don't update the same problem twice
            const problems = new Set<string>();
            // loop data backwards to get the latest version
            for (let j = data.data.length - 1; j >= 0; j--) {
                const doc = data.data[j];
                if (!problems.has(doc.problem)) {
                    testVersions.push(doc);
                    problems.add(doc.problem);
                }
            }

            console.log(
                `Found ${data.data.length} test versions, updating ${testVersions.length} problems...`,
            );

            const operations: AnyBulkWriteOperation<any>[] = testVersions.map(
                (doc) => {
                    return {
                        updateOne: {
                            filter: { address: doc.problem },
                            update: {
                                $set: {
                                    testVersion: parseInt(doc.version),
                                    gasLimit: parseInt(doc.gasLimit),
                                },
                            },
                        },
                    };
                },
            );

            await this.problemModel.bulkWrite(operations);

            const lastSyncingIndex = parseInt(
                data.data[data.data.length - 1].syncingIndex,
            );

            await this.syncMetadataModel.updateOne(
                {},
                { testVersions: lastSyncingIndex },
                { upsert: true },
            );
        }
    }

    async pullUsers(local: number, remote: number) {
        if (remote <= local) return;
        console.log(`Pulling users from ${local} to ${remote}...`);
        for (let i = local; i < remote; i += SUBGRAPH_FETCH_LIMIT) {
            const endpoint = SUBGRAPH_URL;
            const data = await request<{ data: UserDto[] }>(
                endpoint,
                USERS_QUERY,
                {
                    first: SUBGRAPH_FETCH_LIMIT,
                    lastSyncingIndex: i,
                },
            );
            const operations: AnyBulkWriteOperation<any>[] = data.data.map(
                (doc) => {
                    const username = doc.username;
                    return {
                        updateOne: {
                            filter: { username },
                            update: {
                                $setOnInsert: {
                                    address: doc.address,
                                    username: doc.username,
                                    gate: doc.gate,

                                    block: parseInt(doc.block),
                                    timestamp: new Date(
                                        parseInt(doc.timestamp) * 1000,
                                    ),
                                    txHash: doc.txHash,
                                },
                            },
                            upsert: true,
                        },
                    };
                },
            );

            await this.userModel.bulkWrite(operations);
            const lastSyncingIndex = parseInt(
                data.data[data.data.length - 1].syncingIndex,
            );
            await this.syncMetadataModel.updateOne(
                {},
                { users: lastSyncingIndex },
                { upsert: true },
            );
        }
    }

    async pullProblemDeadlines(local: number, remote: number) {
        if (remote <= local) return;
        console.log(`Pulling problem deadlines from ${local} to ${remote}...`);
        for (let i = local; i < remote; i += SUBGRAPH_FETCH_LIMIT) {
            const endpoint = SUBGRAPH_URL;
            const data = await request<{ data: ProblemDeadlineDto[] }>(
                endpoint,
                PROBLEM_DEADLINES_QUERY,
                {
                    first: SUBGRAPH_FETCH_LIMIT,
                    lastSyncingIndex: i,
                },
            );
            const operations: AnyBulkWriteOperation<any>[] = data.data.map(
                (doc) => {
                    const address = doc.problem;
                    return {
                        updateOne: {
                            filter: { address },
                            update: {
                                $set: {
                                    deadline: doc.deadline,
                                },
                            },
                        },
                    };
                },
            );

            await this.problemModel.bulkWrite(operations);
            const lastSyncingIndex = parseInt(
                data.data[data.data.length - 1].syncingIndex,
            );
            await this.syncMetadataModel.updateOne(
                {},
                { problemDeadlines: lastSyncingIndex },
                { upsert: true },
            );
        }
    }

    async getSyncMetadata(): Promise<Record<string, number>> {
        const doc = await this.syncMetadataModel.findOne().select('-_id -__v');
        return (doc?.toJSON() as any) ?? {};
    }

    async getBundle() {
        const endpoint = SUBGRAPH_URL;
        const data = await request<{ data: BundleDto[] }>(
            endpoint,
            BUNDLES_QUERY,
        );

        const bundleMap = data.data.reduce((a, b) => {
            if (!a[b.id]) {
                a[b.id] = parseInt(b.syncingIndex);
            }
            return a;
        }, {} as Record<string, number>);

        return bundleMap;
    }
}
