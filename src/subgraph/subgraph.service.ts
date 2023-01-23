import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import request from 'graphql-request';
import { Model } from 'mongoose';
import { Problem } from 'src/schema/problem.schema';
import {
    SyncMetadata,
    SyncMetadataDocument,
} from 'src/schema/syncMetadata.schema';
import { BundleDto } from './dtos/bundle.dto';
import { ProblemDto } from './dtos/problem.dto';
import { BUNDLES_QUERY } from './queries/bundles';
import { PROBLEMS_QUERY } from './queries/problems';
import { AnyBulkWriteOperation } from 'mongodb';

const SUBGRAPH_URL =
    'https://api.thegraph.com/subgraphs/name/leduythuccs/solidity-judge';
const SUBGRAPH_FETCH_LIMIT = 1_000;

@Injectable()
export class SubgraphService {
    constructor(
        @InjectModel(SyncMetadata.name, 'core')
        private syncMetadataModel: Model<SyncMetadataDocument>,
        @InjectModel(Problem.name, 'core')
        private problemModel: Model<Problem>,
    ) {}

    @Cron('*/30 * * * * *')
    async handleCron() {
        const localBundle = await this.getSyncMetadata();
        const remoteBundle = await this.getBundle();
        await this.pullProblems(
            localBundle['problems'] ?? 0,
            remoteBundle['problems'] ?? 0,
        );
    }

    async pullProblems(local: number, remote: number) {
        if (remote <= local) return;
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
